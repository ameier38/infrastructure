import * as cloudflare from '@pulumi/cloudflare'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { monitoringNamespace } from './namespace'
import { ambassadorExitNodeIp } from './inlets'
import { zone } from './dns'
import { oauthFilter } from './filter'

const identifier = `${config.env}-seq`

const record = new cloudflare.Record(identifier, {
    zoneId: zone.id,
    name: 'seq',
    type: 'A',
    value: ambassadorExitNodeIp
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

const chart = new k8s.helm.v3.Chart(identifier, {
    chart: 'seq',
    version: '2020.4.5070',
    fetchOpts: {
        repo: 'https://helm.datalust.co'
    },
    namespace: monitoringNamespace.metadata.name,
    values: {
        nodeSelector: { 'kubernetes.io/arch': 'amd64' }
    }
}, { provider: config.k8sProvider })

export const internalHost =
    pulumi.all([chart, monitoringNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, identifier, 'metadata'))
    .apply(meta => `${meta.name}.${meta.namespace}.svc.cluster.local`)

export const internalIngestionPort =
    pulumi.all([chart, monitoringNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, identifier, 'spec'))
    .apply(spec => spec.ports.find(port => port.name === 'ingestion')!.port)

const internalUiPort =
    pulumi.all([chart, monitoringNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, identifier, 'spec'))
    .apply(spec => spec.ports.find(port => port.name === 'ui')!.port)

// NB: specifies how to direct incoming requests
new k8s.apiextensions.CustomResource(`${identifier}-mapping`, {
    apiVersion: 'getambassador.io/v2',
    kind: 'Mapping',
    metadata: { namespace: monitoringNamespace.metadata.name },
    spec: {
        prefix: '/',
        host: record.hostname,
        service: pulumi.interpolate `${internalHost}:${internalUiPort}`
    }
}, { provider: config.k8sProvider })

// NB: add authentication
new k8s.apiextensions.CustomResource(`${identifier}-filter-policy`, {
    apiVersion: 'getambassador.io/v2',
    kind: 'FilterPolicy',
    metadata: { namespace: monitoringNamespace.metadata.name },
    spec: {
        rules: [{
            host: record.hostname,
            path: '*',
            filters: [
                { name: oauthFilter.metadata.name, namespace: oauthFilter.metadata.namespace, arguments: { scopes: ['openid'] } }
            ]
        }]
    }
}, { provider: config.k8sProvider })
