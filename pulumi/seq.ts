import * as cloudflare from '@pulumi/cloudflare'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { zone } from './zone'
import { gateway } from './gateway'
import { k8sProvider } from './cluster'
import { infrastructureNamespace, monitoringNamespace } from './namespace'
import { oauthFilter } from './filter'

type SeqArgs = {
    chartVersion: pulumi.Input<string>
    namespace: pulumi.Input<string>
    filterNamespace: pulumi.Input<string>
    zoneId: pulumi.Input<string>
    subdomain: pulumi.Input<string>
    loadBalancerAddress: pulumi.Input<string>
    authUrl: pulumi.Input<string>
    acmeEmail: pulumi.Input<string>
    oauthFilter: pulumi.Input<string>
}

export class Seq extends pulumi.ComponentResource {
    host: pulumi.Output<string>
    internalHost: pulumi.Output<string>
    internalIngestionPort: pulumi.Output<number>
    internalUiPort: pulumi.Output<number>

    constructor(name:string, args:SeqArgs, opts:pulumi.ComponentResourceOptions) {
        super('infrastructure:Seq', name, {}, opts)

        const chart = new k8s.helm.v3.Chart(`${name}-seq`, {
            chart: 'seq',
            version: args.chartVersion,
            fetchOpts: {
                repo: 'https://kubernetes-charts.storage.googleapis.com/'
            },
            namespace: args.namespace
        }, { parent: this })

        this.internalHost =
            pulumi.all([chart, args.namespace])
            .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, `${name}-seq`, 'metadata'))
            .apply(meta => `${meta.name}.${meta.namespace}.svc.cluster.local`)

        this.internalIngestionPort =
            pulumi.all([chart, args.namespace])
            .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, `${name}-seq`, 'spec'))
            .apply(spec => spec.ports.find(port => port.name === 'ingestion')!.port)

        this.internalUiPort =
            pulumi.all([chart, args.namespace])
            .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, `${name}-seq`, 'spec'))
            .apply(spec => spec.ports.find(port => port.name === 'ui')!.port)


        const record = new cloudflare.Record(`${name}-seq`, {
            zoneId: args.zoneId,
            name: args.subdomain,
            type: 'A',
            value: args.loadBalancerAddress
        }, { parent: this })

        this.host = record.hostname

        // NB: generates certificate
        new k8s.apiextensions.CustomResource(`${name}-seq`, {
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
        new k8s.apiextensions.CustomResource(`${name}-seq`, {
            apiVersion: 'getambassador.io/v2',
            kind: 'Mapping',
            metadata: { namespace: args.namespace },
            spec: {
                prefix: '/',
                host: this.host,
                service: pulumi.interpolate `${this.internalHost}:${this.internalUiPort}`
            }
        }, { parent: this })

        // NB: add authentication
        new k8s.apiextensions.CustomResource(`${name}-seq`, {
            apiVersion: 'getambassador.io/v2',
            kind: 'FilterPolicy',
            metadata: { namespace: args.namespace },
            spec: {
                rules: [{
                    host: record.hostname,
                    path: '*',
                    filters: [
                        { name: args.oauthFilter, namespace: args.filterNamespace, arguments: { scopes: ['openid'] } }
                    ]
                }]
            }
        }, { parent: this })

        this.registerOutputs({
            internalHost: this.internalHost,
            internalIngestionPort: this.internalIngestionPort,
            internalUiPort: this.internalUiPort
        })
    }
}

export const seq = new Seq(config.env, {
    chartVersion: '2.3.0',
    namespace: monitoringNamespace.metadata.name,
    filterNamespace: infrastructureNamespace.metadata.name,
    zoneId: zone.id,
    subdomain: 'seq',
    loadBalancerAddress: gateway.loadBalancerAddress,
    authUrl: config.auth0Config.authUrl,
    acmeEmail: config.acmeEmail,
    oauthFilter: oauthFilter.metadata.name
}, { provider: k8sProvider })
