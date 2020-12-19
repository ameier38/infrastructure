import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { infrastructureNamespace } from './namespace'

const chart = new k8s.helm.v3.Chart(config.env, {
    chart: 'ambassador',
    fetchOpts: {
        repo: 'https://getambassador.io'
    },
    version: '6.5.10',
    namespace: infrastructureNamespace.metadata.name,
    values: {
        replicaCount: 1,
        test: {
            enabled: false
        },
        crds: {
            enabled: true,
            create: true,
            keep: false
        },
        adminService: {
            create: false
        },
        createDevPortalMappings: false,
        service: { 
            type: 'ClusterIP',
            ports: [
                { name: 'http', port: 80, targetPort: 8080 },
                { name: 'https', port: 443, targetPort: 8443 }
            ]
        },
        env: {
            // NB: disables openapi calls for developer docs
            POLL_EVERY_SECS: 0
        },
        nodeSelector: { 'kubernetes.io/arch': 'amd64' }
    }
}, { provider: config.k8sProvider })


export const internalHost =
    pulumi.all([chart, infrastructureNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, `${config.env}-ambassador`, 'metadata'))
    .apply(meta => `${meta.name}.${meta.namespace}.svc.cluster.local`)

export const internalPort =
    pulumi.all([chart, infrastructureNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, `${config.env}-ambassador`, 'spec'))
    .apply(spec => spec.ports.find(port => port.name === 'http')!.port)
