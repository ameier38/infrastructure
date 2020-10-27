import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { k8sProvider, monitoringNamespace } from './k8s'

type PrometheusArgs = {
    chartVersion: pulumi.Input<string>
    namespace: k8s.core.v1.Namespace
}

export class Prometheus extends pulumi.ComponentResource {
    internalHost: pulumi.Output<string>
    internalPort: pulumi.Output<number>

    constructor(name:string, args:PrometheusArgs, opts:pulumi.ComponentResourceOptions) {
        super('infrastructure:Prometheus', name, {}, opts)

        const chart = new k8s.helm.v3.Chart(name, {
            chart: 'prometheus',
            version: args.chartVersion,
            fetchOpts: {
                repo: 'https://prometheus-community.github.io/helm-charts'
            },
            namespace: args.namespace.metadata.name
        }, { parent: this })

        this.internalHost =
            pulumi.all([chart, args.namespace.metadata.name])
            .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, `${name}-prometheus-server`, 'metadata'))
            .apply(meta => `${meta.name}.${meta.namespace}.svc.cluster.local`)

        this.internalPort =
            pulumi.all([chart, args.namespace.metadata.name])
            .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, `${name}-prometheus-server`, 'spec'))
            .apply(spec => spec.ports.find(port => port.name === 'http')!.port)

        this.registerOutputs({
            internalHost: this.internalHost,
            internalPort: this.internalPort
        })
    }
}

export const prometheus = new Prometheus(config.env, {
    chartVersion: '11.16.4',
    namespace: monitoringNamespace
}, { provider: k8sProvider })
