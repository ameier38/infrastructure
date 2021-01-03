import * as pulumi from '@pulumi/pulumi'
import './ambassador'
import './identity'
import './prometheus'
import './grafana'
import * as bucket from './bucket'
import * as inlets from './inlets'
import * as registry from './registry'
import * as dns from './dns'
import * as seq from './seq'
import * as config from './config'

export const amIconUrl = bucket.amIconUrl
export const acmeEmail = config.acmeEmail
export const ambassadorExitNodeIp = inlets.ambassadorExitNodeIp
export const k8sExitNodeIp = inlets.k8sExitNodeIp
export const zoneId = dns.zone.id
export const zone = dns.zone.zone
export const kubeconfig = pulumi.secret(config.kubeconfig)
export const registryEndpoint = pulumi.secret(registry.registryEndpoint)
export const dockerCredentials = pulumi.secret(registry.dockerCredentials)
export const imageRegistry = pulumi.secret(registry.imageRegistry)
export const seqInternalHost = seq.internalHost
export const seqInternalPort = seq.internalIngestionPort
