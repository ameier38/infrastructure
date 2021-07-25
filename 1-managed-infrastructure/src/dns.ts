import * as cloudflare from '@pulumi/cloudflare'
import * as config from './config'

const zone = new cloudflare.Zone('default', {
    zone: config.zone
}, { provider: config.cloudflareProvider })

export const zoneId = zone.id
