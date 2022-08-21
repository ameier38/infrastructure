import * as namespace from './src/k8s/namespace'
import * as prometheus from './src/k8s/prometheus'
import * as loki from './src/k8s/loki'
import './src/k8s'

export const monitoringNamespace = namespace.monitoringNamespace
export const andrewmeierNamespace = namespace.andrewmeierNamespace
export const prometheusUrl = prometheus.internalUrl
export const lokiUrl = loki.internalUrl
