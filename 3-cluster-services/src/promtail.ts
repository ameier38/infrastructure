import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as namespace from './namespace'
import * as loki from './loki'

new k8s.helm.v3.Chart('promtail', {
    chart: 'promtail',
    version: '3.11.0',
    fetchOpts: { repo: 'https://grafana.github.io/helm-charts' },
    namespace: namespace.monitoringNamespace,
    values: {
        config: {
            lokiAddress: pulumi.interpolate `${loki.internalUrl}/loki/api/v1/push`
        }
    }
})
