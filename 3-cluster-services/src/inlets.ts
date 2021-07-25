import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { infrastructureNamespace } from './namespace'
import { internalHost as ambassadorInternalHost } from './ambassador'

const labels = { 'app.kubernetes.io/name': 'inlets' }

// new k8s.apps.v1.Deployment('inlets', {
//     metadata: { namespace: infrastructureNamespace.metadata.name },
//     spec: {
//         selector: { matchLabels: labels },
//         replicas: 1,
//         template: {
//             metadata: { labels: labels },
//             spec: {
//                 containers: [{
//                     name: 'inlets',
//                     image: pulumi.interpolate `ghcr.io/inlets/inlets-pro:${config.inletsConfig.version}`,
//                     imagePullPolicy: 'IfNotPresent',
//                     command: ['inlets-pro'],
//                     args: [
//                         'tcp',
//                         'client',
//                         pulumi.interpolate `--url=wss://${config.exitNodeIp}:8123/connect`,
//                         pulumi.interpolate `--token=${config.inletsConfig.token}`,
//                         pulumi.interpolate `--upstream=${ambassadorInternalHost}`,
//                         // NB: inlets server will forward requests for these ports to the ambassador service
//                         '--ports=80,443',
//                         pulumi.interpolate `--license=${config.inletsConfig.license}`
//                     ],
//                     resources: {
//                         limits: { memory: '128Mi' },
//                         requests: { cpu: '25m', memory: '25Mi' }
//                     }
//                 }],
//                 nodeSelector: { 'kubernetes.io/arch': 'arm' }
//             }
//         }
//     }
// }, { provider: config.k8sProvider })
