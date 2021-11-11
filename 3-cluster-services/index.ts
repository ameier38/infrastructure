import './src/prometheus'
import './src/grafana'
import './src/inlets'
import * as namespace from './src/namespace'
import * as seq from './src/seq'
import * as ambassador from './src/ambassador'

export const blogNamespace = namespace.blogNamespace.metadata.name
export const ackmxNamespace = namespace.ackmxNamespace.metadata.name
export const easuryNamespace = namespace.easuryNamespace.metadata.name
export const loadBalancerIpAddress = ambassador.loadBalancerIpAddress
export const seqHost = seq.internalHost
export const seqPort = seq.internalIngestionPort
