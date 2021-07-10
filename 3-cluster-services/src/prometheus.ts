import * as cloudflare from '@pulumi/cloudflare'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { ambassadorChart } from './ambassador'
import { oauthFilter } from './filter'
import { monitoringNamespace } from './namespace'

const identifier = 'prometheus'

const chart = new k8s.helm.v3.Chart(identifier, {
    chart: 'prometheus',
    version: '14.1.0',
    fetchOpts: {
        repo: 'https://prometheus-community.github.io/helm-charts'
    },
    namespace: monitoringNamespace.metadata.name,
    values: {
        alertmanager: {
            enabled: true,
            nodeSelector: { 'kubernetes.io/arch': 'amd64' }
        },
        kubeStateMetrics: {
            enabled: false
        },
        nodeExporter: {
            enabled: true,
            nodeSelector: { 'kubernetes.io/arch': 'amd64' }
        },
        server: {
            enabled: true,
            nodeSelector: { 'kubernetes.io/arch': 'amd64' }
        },
        pushgateway: {
            enabled: false
        }
    }
}, { provider: config.k8sProvider })

export const internalHost =
    pulumi.all([chart, monitoringNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, `${identifier}-server`, 'metadata'))
    .apply(meta => `${meta.name}.${meta.namespace}.svc.cluster.local`)

export const internalPort =
    pulumi.all([chart, monitoringNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, `${identifier}-server`, 'spec'))
    .apply(spec => spec.ports.find(port => port.name === 'http')!.port)

const record = new cloudflare.Record(identifier, {
    zoneId: config.zoneId,
    name: 'prometheus',
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
            ]
        }]
    }
}, { provider: config.k8sProvider, dependsOn: ambassadorChart })
