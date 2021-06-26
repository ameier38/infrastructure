import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as cloudflare from '@pulumi/cloudflare'
import * as config from './config'
import { oauthFilter, jwtFilter } from './filter'
import { monitoringNamespace } from './namespace'
import { ambassadorChart } from './ambassador'
import * as prometheus from './prometheus'

const identifier = 'grafana'

const userKey = 'admin-user'
const passwordKey = 'admin-password'

const secret = new k8s.core.v1.Secret(identifier, {
    metadata: { namespace: monitoringNamespace.metadata.name },
    stringData: {
        [userKey]: 'admin',
        [passwordKey]: config.grafanaConfig.adminPassword
    }
}, { provider: config.k8sProvider })

const chart = new k8s.helm.v3.Chart(identifier, {
    chart: 'grafana',
    version: '6.9.1',
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
        nodeSelector: { 'kubernetes.io/arch': 'arm' },
        admin: {
            existingSecret: secret.metadata.name,
            userKey: userKey,
            passwordKey: passwordKey
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
        dashboardProviders: {
            'dashboardproviders.yaml': {
                apiVersion: 1,
                providers: [{
                    name: 'default',
                    orgId: 1,
                    folder: '',
                    type: 'file',
                    disableDeletion: true,
                    editable: false,
                    options: {
                        path: '/var/lib/grafana/dashboards/default'
                    }
                }],
            },
        },
        dashboards: {
            default: {
                kubernetes: {
                    gnetId: 315,
                    revision: 3,
                    datasource: 'Prometheus'
                }
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

const record = new cloudflare.Record(identifier, {
    zoneId: config.zoneId,
    name: 'grafana',
    type: 'A',
    value: config.exitNodeIp
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
}, { provider: config.k8sProvider, dependsOn: ambassadorChart })

// NB: specifies how to direct incoming requests
new k8s.apiextensions.CustomResource(`${identifier}-mapping`, {
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
}, { provider: config.k8sProvider, dependsOn: ambassadorChart })

// NB: specifies which filters to use for incoming requests
new k8s.apiextensions.CustomResource(`${identifier}-filter-policy`, {
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
}, { provider: config.k8sProvider, dependsOn: ambassadorChart })
