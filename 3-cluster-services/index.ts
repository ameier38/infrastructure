import * as namespace from './src/namespace'
import * as prometheus from './src/prometheus'
import * as loki from './src/loki'
import './src/promtail'


export const monitoringNamespace = namespace.monitoringNamespace
export const cloudflaredNamespace = namespace.cloudflaredNamespace
export const blogNamespace = namespace.blogNamespace
export const prometheusUrl = prometheus.internalUrl
export const lokiUrl = loki.internalUrl
