import * as pulumi from '@pulumi/pulumi'
import './auth0'
import './eventstore'
import './mongo'
import './prometheus'
import './grafana'
import './seq'
import { gateway } from './gateway'
import { registry } from './registry'
import { cluster, appsNamespace } from './k8s'
import { tldZone } from './zone'

export { tld, acmeEmail } from './config'
export const tldZoneId = tldZone.id
export const kubeconfig = pulumi.secret(cluster.kubeconfig)
export const appsNamespaceName = appsNamespace.metadata.name
export const imageRegistry = pulumi.secret(registry.imageRegistry)
export const loadBalancerAddress = gateway.loadBalancerAddress
