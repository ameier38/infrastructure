import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { monitoringNamespace } from './namespace'

const identifier = `${config.env}-prometheus`

const chart = new k8s.helm.v3.Chart(identifier, {
    chart: 'prometheus',
    version: '13.0.0',
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
