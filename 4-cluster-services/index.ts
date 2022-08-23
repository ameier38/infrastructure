import * as namespace from './src/k8s/namespace'
import * as prometheus from './src/k8s/prometheus'
import * as loki from './src/k8s/loki'
import * as tunnel from './src/cloudflare/tunnel'
import './src/aws'
import './src/cloudflare'
import './src/k8s'

export const k8sTunnelHost = tunnel.k8sTunnel.cname
export const monitoringNamespace = namespace.monitoringNamespace
export const andrewmeierNamespace = namespace.andrewmeierNamespace
export const prometheusUrl = prometheus.internalUrl
export const lokiUrl = loki.internalUrl
