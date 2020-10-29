import * as cloudflare from '@pulumi/cloudflare'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { gateway } from './gateway'
import { prometheus } from './prometheus'
import { k8sProvider } from './cluster'
import { infrastructureNamespace, monitoringNamespace } from './namespace'
import { zone } from './zone'
import { oauthFilter, jwtFilter } from './filter'

type GrafanaArgs = {
    chartVersion: pulumi.Input<string>
    namespace: pulumi.Input<string>
    filterNamespace: pulumi.Input<string>
    adminPassword: pulumi.Input<string>
    zoneId: pulumi.Input<string>
    subdomain: pulumi.Input<string>
    authUrl: pulumi.Input<string>
    acmeEmail: pulumi.Input<string>
    oauthFilter: pulumi.Input<string>
    jwtFilter: pulumi.Input<string>
    loadBalancerAddress: pulumi.Input<string>
    prometheusUrl: pulumi.Input<string>
}

export class Grafana extends pulumi.ComponentResource {
    host: pulumi.Output<string>
    internalHost: pulumi.Output<string>
    internalPort: pulumi.Output<number>

    constructor(name:string, args:GrafanaArgs, opts:pulumi.ComponentResourceOptions) {
        super('infrastructure:Grafana', name, {}, opts)

        const record = new cloudflare.Record(`${name}-grafana`, {
            zoneId: args.zoneId,
            name: args.subdomain,
            type: 'A',
            value: args.loadBalancerAddress
        }, { parent: this })

        this.host = record.hostname

        const secret = new k8s.core.v1.Secret(`${name}-grafana`, {
            metadata: { namespace: args.namespace },
            stringData: {
                'admin-user': 'admin',
                'admin-password': args.adminPassword
            }
        }, { parent: this })

        const chart = new k8s.helm.v3.Chart(name, {
            chart: 'grafana',
            version: args.chartVersion,
            fetchOpts: {
                repo: 'https://grafana.github.io/helm-charts'
            },
            namespace: args.namespace,
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
                            url: args.prometheusUrl,
                            access: 'proxy',
                            isDefault: true
                        }]
                    }

                },
                'grafana.ini': {
                    'auth': {
                        allow_sign_up: false,
                        auto_assign_org: true,
                        auto_assign_org_role: 'Editor'
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
        }, { parent: this })

        this.internalHost =
            pulumi.all([chart, args.namespace])
            .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, `${name}-grafana`, 'metadata'))
            .apply(meta => `${meta.name}.${meta.namespace}.svc.cluster.local`)

        this.internalPort =
            pulumi.all([chart, args.namespace])
            .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, `${name}-grafana`, 'spec'))
            .apply(spec => spec.ports.find(port => port.name === 'service')!.port)

        // NB: generates certificate
        new k8s.apiextensions.CustomResource(`${name}-grafana`, {
            apiVersion: 'getambassador.io/v2',
            kind: 'Host',
            metadata: { namespace: args.namespace },
            spec: {
                hostname: this.host,
                acmeProvider: {
                    email: args.acmeEmail
                }
            }
        }, { parent: this })

        // NB: specifies how to direct incoming requests
        new k8s.apiextensions.CustomResource(`${name}-grafana`, {
            apiVersion: 'getambassador.io/v2',
            kind: 'Mapping',
            metadata: { namespace: args.namespace },
            spec: {
                prefix: '/',
                host: this.host,
                // NB: otherwise Grafana thinks it should use it
                remove_request_headers: ['authorization'],
                service: pulumi.interpolate `${this.internalHost}:${this.internalPort}`
            }
        }, { parent: this })

        // NB: add authentication
        new k8s.apiextensions.CustomResource(`${name}-grafana`, {
            apiVersion: 'getambassador.io/v2',
            kind: 'FilterPolicy',
            metadata: { namespace: args.namespace },
            spec: {
                rules: [{
                    host: record.hostname,
                    path: '*',
                    filters: [
                        { name: args.oauthFilter, namespace: args.filterNamespace, arguments: { scopes: ['openid'] } },
                        { name: args.jwtFilter, namespace: args.filterNamespace }
                    ]
                }]
            }
        }, { parent: this })

        this.registerOutputs({
            host: this.host,
            internalHost: this.internalHost,
            internalPort: this.internalPort
        })
    }
}

export const grafana = new Grafana(config.env, {
    chartVersion: '5.8.12',
    namespace: monitoringNamespace.metadata.name,
    filterNamespace: infrastructureNamespace.metadata.name,
    adminPassword: config.grafanaConfig.adminPassword,
    zoneId: zone.id,
    subdomain: 'grafana',
    authUrl: config.auth0Config.authUrl,
    acmeEmail: config.acmeEmail,
    oauthFilter: oauthFilter.metadata.name,
    jwtFilter: jwtFilter.metadata.name,
    loadBalancerAddress: gateway.loadBalancerAddress,
    prometheusUrl: pulumi.interpolate `http://${prometheus.internalHost}:${prometheus.internalPort}`
}, { providers: [ k8sProvider, config.auth0Provider, config.cloudflareProvider ] })
