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
