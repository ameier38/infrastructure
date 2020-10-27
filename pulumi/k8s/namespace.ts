import * as k8s from '@pulumi/kubernetes'
import { k8sProvider } from './cluster'

export const infrastructureNamespace = new k8s.core.v1.Namespace('infrastructure', {}, { provider: k8sProvider })

export const monitoringNamespace = new k8s.core.v1.Namespace('monitoring', {}, { provider: k8sProvider })

export const appsNamespace = new k8s.core.v1.Namespace('apps', {}, { provider: k8sProvider })
