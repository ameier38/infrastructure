import * as cloudflare from '@pulumi/cloudflare'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import * as prometheus from './prometheus'
import { exitNodeIp } from './inlets'
import { monitoringNamespace } from './namespace'
import { zone } from './dns'
import { oauthFilter, jwtFilter } from './filter'

const identifier = `${config.env}-grafana`

const record = new cloudflare.Record(identifier, {
    zoneId: zone.id,
    name: 'grafana',
    type: 'A',
    value: exitNodeIp
}, { provider: config.cloudflareProvider })

// NB: generates certificate
new k8s.apiextensions.CustomResource(`${identifier}-host`, {
    apiVersion: 'getambassador.io/v2',
    kind: 'Host',
    metadata: { namespace: monitoringNamespace.metadata.name },
    spec: {
        hostname: record.hostname,
        acmeProvider: {
            email: config.acmeEmail
        }
    }
}, { provider: config.k8sProvider })

const secret = new k8s.core.v1.Secret(identifier, {
    metadata: { namespace: monitoringNamespace.metadata.name },
    stringData: {
        'admin-user': 'admin',
        'admin-password': config.grafanaConfig.adminPassword
    }
}, { provider: config.k8sProvider })

const chart = new k8s.helm.v3.Chart(identifier, {
    chart: 'grafana',
    version: '6.1.16',
    fetchOpts: {
        repo: 'https://grafana.github.io/helm-charts'
    },
    namespace: monitoringNamespace.metadata.name,
    transformations: [(obj:any) => {
        if (obj.metadata !== undefined) {
            if (obj.metadata.name && obj.metadata.name.includes('test')) {
                obj.apiVersion = 'v1'
                obj.kind = 'List'
                obj.items = []
            }
        }
    }],
    values: {
        admin: {
            existingSecret: secret.metadata.name,
            userKey: 'admin-user',
            passwordKey: 'admin-password'
        },
        datasources: {
            'datasources.yaml': {
                apiVersion: 1,
                datasources: [{
                    name: 'Prometheus',
                    type: 'prometheus',
                    url: pulumi.interpolate `http://${prometheus.internalHost}:${prometheus.internalPort}`,
                    access: 'proxy',
                    isDefault: true
                }]
            }

        },
        'grafana.ini': {
            'auth': {
                allow_sign_up: false,
                auto_assign_org: true,
                auto_assign_org_role: 'Organization admin'
            },
            'auth.proxy': {
                enabled: true,
                // NB: injected using JWT filter
                header_name: 'X-WEBAUTH-USER',
                header_property: 'username',
                auto_sign_up: true,
                sync_ttl: 60
            }
        }
    }
}, { provider: config.k8sProvider })

const internalHost =
    pulumi.all([chart, monitoringNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, identifier, 'metadata'))
    .apply(meta => `${meta.name}.${meta.namespace}.svc.cluster.local`)

const internalPort =
    pulumi.all([chart, monitoringNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, identifier, 'spec'))
    .apply(spec => spec.ports.find(port => port.name === 'service')!.port)

// NB: specifies how to direct incoming requests
new k8s.apiextensions.CustomResource(identifier, {
    apiVersion: 'getambassador.io/v2',
    kind: 'Mapping',
    metadata: { namespace: monitoringNamespace.metadata.name },
    spec: {
        prefix: '/',
        host: record.hostname,
        // NB: otherwise Grafana thinks it should use it
        remove_request_headers: ['authorization'],
        service: pulumi.interpolate `${internalHost}:${internalPort}`
    }
}, { provider: config.k8sProvider })

// NB: add authentication
new k8s.apiextensions.CustomResource(identifier, {
    apiVersion: 'getambassador.io/v2',
    kind: 'FilterPolicy',
    metadata: { namespace: monitoringNamespace.metadata.name },
    spec: {
        rules: [{
            host: record.hostname,
            path: '*',
            filters: [
                { name: oauthFilter.metadata.name, namespace: oauthFilter.metadata.namespace, arguments: { scopes: ['openid'] } },
                { name: jwtFilter.metadata.name, namespace: jwtFilter.metadata.namespace }
            ]
        }]
    }
}, { provider: config.k8sProvider })
