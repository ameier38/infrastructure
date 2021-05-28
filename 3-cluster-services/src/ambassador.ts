import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { infrastructureNamespace } from './namespace'

const identifier = 'ambassador'

const ambassadorChart = new k8s.helm.v3.Chart(identifier, {
    chart: 'ambassador',
    fetchOpts: {
        repo: 'https://getambassador.io'
    },
    version: '6.7.9',
    namespace: infrastructureNamespace.metadata.name,
    transformations: [(obj:any) => {
        if (obj.metadata !== undefined) {
            if (obj.metadata.name && obj.metadata.name.includes('crd-cleanup')) {
                obj.apiVersion = 'v1'
                obj.kind = 'List'
                obj.items = []
            }
        }
    }],
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
        // NB: make sure it runs on Ubuntu nodes (cannot run on ARM)
        nodeSelector: { 'kubernetes.io/arch': 'amd64' }
    }
}, { provider: config.k8sProvider })


export const internalHost =
    pulumi.all([ambassadorChart, infrastructureNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, identifier, 'metadata'))
    .apply(meta => `${meta.name}.${meta.namespace}.svc.cluster.local`)

export const internalPort =
    pulumi.all([ambassadorChart, infrastructureNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, identifier, 'spec'))
    .apply(spec => spec.ports.find(port => port.name === 'http')!.port)
