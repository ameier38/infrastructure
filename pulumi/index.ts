import * as pulumi from '@pulumi/pulumi'
import './auth0'
import './prometheus'
import './grafana'
import './seq'
import './filter'
import './inlets'
import { cluster } from './cluster'
import { gateway } from './gateway'
import { registry } from './registry'
import { seq } from './seq'
import { zone } from './zone'
export { loadBalancerAddress as piLoadBalancerAddress } from './inlets'
import * as config from './config'

export { zone, acmeEmail } from './config'
export const zoneId = zone.id
export const kubeconfig = pulumi.secret(cluster.kubeconfig)
export const piKubeconfig = pulumi.secret(config.piKubeconfig)
export const registryEndpoint = pulumi.secret(registry.endpoint)
export const dockerCredentials = pulumi.secret(registry.dockerCredentials)
export const imageRegistry = pulumi.secret(registry.imageRegistry)
export const loadBalancerAddress = gateway.loadBalancerAddress
export const seqInternalHost = seq.internalHost
export const seqInternalPort = seq.internalIngestionPort