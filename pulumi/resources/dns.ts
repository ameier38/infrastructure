import * as cloudflare from '@pulumi/cloudflare'
import * as k8s from '@pulumi/kubernetes'
import * as config from './config'
import { ambassadorExitNodeIp, k8sExitNodeIp } from './inlets'
import { infrastructureNamespace } from './namespace'

export const zone = new cloudflare.Zone(config.zone, {
    zone: config.zone
}, { provider: config.cloudflareProvider })

export const rootRecord = new cloudflare.Record('root', {
    zoneId: zone.id,
    name: '@',
    type: 'A',
    value: ambassadorExitNodeIp
}, { provider: config.cloudflareProvider })

// NB: generates certificate
new k8s.apiextensions.CustomResource('root-host', {
    apiVersion: 'getambassador.io/v2',
    kind: 'Host',
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        hostname: rootRecord.hostname,
        acmeProvider: {
            email: config.acmeEmail
        }
    }
}, { provider: config.k8sProvider })

export const k8sRecord = new cloudflare.Record('k8s', {
    zoneId: zone.id,
    name: 'k8s',
    type: 'A',
    value: k8sExitNodeIp
}, { provider: config.cloudflareProvider })
