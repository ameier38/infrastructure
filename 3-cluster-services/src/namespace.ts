import * as k8s from '@pulumi/kubernetes'
import * as config from './config'

export const infrastructureNamespace = new k8s.core.v1.Namespace('infrastructure', {
    metadata: { name: 'infrastructure' }
}, { provider: config.k8sProvider })

export const monitoringNamespace = new k8s.core.v1.Namespace('monitoring', {
    metadata: { name: 'monitoring' }
}, { provider: config.k8sProvider })

export const blogNamespace = new k8s.core.v1.Namespace('blog', {
    metadata: { name: 'blog' }
}, { provider: config.k8sProvider })

export const ackmxNamespace = new k8s.core.v1.Namespace('ackmx', {
    metadata: { name: 'ackmx' }
}, { provider: config.k8sProvider })

export const easuryNamespace = new k8s.core.v1.Namespace('easury', {
    metadata: { name: 'easury' }
}, { provider: config.k8sProvider })
