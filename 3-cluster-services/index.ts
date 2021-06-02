import * as pulumi from '@pulumi/pulumi'
import './src/ambassador'
import './src/filter'
import './src/grafana'
import './src/inlets'
import './src/prometheus'

import * as config from './src/config'
import * as namespace from './src/namespace'
import * as seq from './src/seq'

export const kubeconfig = pulumi.secret(config.kubeconfig)
export const blogNamespace = namespace.blogNamespace.metadata.name
export const seqHost = seq.internalHost
export const seqPort = seq.internalIngestionPort
