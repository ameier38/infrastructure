import * as k8s from '@pulumi/kubernetes'
import { k8sProvider } from './cluster'

export const infrastructureNamespace = new k8s.core.v1.Namespace('infrastructure', {
    metadata: { name: 'infrastructure' }
}, { provider: k8sProvider })

export const monitoringNamespace = new k8s.core.v1.Namespace('monitoring', {
    metadata: { name: 'monitoring' }
}, { provider: k8sProvider })
