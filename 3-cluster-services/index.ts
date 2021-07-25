import * as pulumi from '@pulumi/pulumi'
import './src/ambassador'
import './src/filter'
import './src/grafana'
import './src/inlets'
import './src/prometheus'

import * as namespace from './src/namespace'
import * as seq from './src/seq'

export const blogNamespace = namespace.blogNamespace.metadata.name
export const ackmxNamespace = namespace.ackmxNamespace.metadata.name
export const seqHost = seq.internalHost
export const seqPort = seq.internalIngestionPort
