import * as cloudflare from '@pulumi/cloudflare'
import * as config from './config'
import * as cluster from './cluster'

const zone = new cloudflare.Zone('default', {
    zone: config.zone
}, { provider: config.cloudflareProvider })

export const zoneId = zone.id

export const k8sRecord = new cloudflare.Record('k8s', {
    zoneId: zoneId,
    name: 'k8s',
    type: 'A',
    value: cluster.endpoint
}, { provider: config.cloudflareProvider })
