import * as cloudflare from '@pulumi/cloudflare'
import * as config from './config'
import { exitNodeIp } from './exitNode'

const zone = new cloudflare.Zone('default', {
    zone: config.zone
}, { provider: config.cloudflareProvider })

export const zoneId = zone.id

export const rootRecord = new cloudflare.Record('root', {
    zoneId: zoneId,
    name: '@',
    type: 'A',
    value: exitNodeIp
}, { provider: config.cloudflareProvider })

export const k8sRecord = new cloudflare.Record('k8s', {
    zoneId: zoneId,
    name: 'k8s',
    type: 'A',
    value: exitNodeIp
}, { provider: config.cloudflareProvider })
