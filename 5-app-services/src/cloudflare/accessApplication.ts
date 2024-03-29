import * as cloudflare from '@pulumi/cloudflare'
import * as record from './record'
import * as config from '../config'

export const traefik = new cloudflare.AccessApplication('traefik', {
    name: 'Traefik',
    domain: record.traefikRecord.hostname,
    allowedIdps: [ config.githubIdentityProviderId ],
    autoRedirectToIdentity: true,
    accountId: config.cloudflareAccountId,
    logoUrl: config.logoUrl,
    httpOnlyCookieAttribute: false
})

export const whoami = new cloudflare.AccessApplication('whoami', {
    name: 'Whoami',
    domain: record.whoamiRecord.hostname,
    allowedIdps: [ config.githubIdentityProviderId ],
    autoRedirectToIdentity: true,
    accountId: config.cloudflareAccountId,
    logoUrl: config.logoUrl,
    httpOnlyCookieAttribute: false
})
