import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as namespace from './namespace'

const chart = new k8s.helm.v3.Chart('loki', {
    chart: 'loki',
    version: '2.10.1',
    fetchOpts: { repo: 'https://grafana.github.io/helm-charts' },
    namespace: namespace.monitoringNamespace
})

const internalHost =
    pulumi.all([chart, namespace.monitoringNamespace]).apply(([chart, namespace]) => {
        const meta = chart.getResourceProperty('v1/Service', namespace, 'loki', 'metadata')
        return pulumi.interpolate `${meta.name}.${meta.namespace}.svc.cluster.local`
    })

const internalPort =
    pulumi.all([chart, namespace.monitoringNamespace]).apply(([chart, namespace]) => {
        const spec = chart.getResourceProperty('v1/Service', namespace, 'loki', 'spec')
        return spec.ports[0].port
    })

export const internalUrl = pulumi.interpolate `http://${internalHost}:${internalPort}`
