import * as cloudflare from '@pulumi/cloudflare'
import * as config from './config'

export const tldZone = new cloudflare.Zone(config.tld, {
    zone: config.tld
}, { provider: config.cloudflareProvider })

export const cosmicdealershipcomZone = new cloudflare.Zone('cosmicdealership.com', {
    zone: 'cosmicdealership.com'
}, { provider: config.cloudflareProvider })
