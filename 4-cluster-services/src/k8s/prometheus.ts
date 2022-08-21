import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as namespace from './namespace'

const chart = new k8s.helm.v3.Chart('prometheus', {
    chart: 'prometheus',
    version: '15.5.3',
    fetchOpts: { repo: 'https://prometheus-community.github.io/helm-charts' },
    namespace: namespace.monitoringNamespace,
    values: {
        serviceAccounts: {
            alertmanager: { create: false },
            pushgateway: { create: false }
        },
        alertmanager: { enabled: false },
        pushgateway: { enabled: false }
    }
})

const internalHost =
    pulumi.all([chart, namespace.monitoringNamespace]).apply(([chart, namespace]) => {
        const meta = chart.getResourceProperty('v1/Service', namespace, 'prometheus-server', 'metadata')
        return pulumi.interpolate `${meta.name}.${meta.namespace}.svc.cluster.local`
    })

const internalPort =
    pulumi.all([chart, namespace.monitoringNamespace]).apply(([chart, namespace]) => {
        const spec = chart.getResourceProperty('v1/Service', namespace, 'prometheus-server', 'spec')
        return spec.ports[0].port
    })

export const internalUrl = pulumi.interpolate `http://${internalHost}:${internalPort}`
