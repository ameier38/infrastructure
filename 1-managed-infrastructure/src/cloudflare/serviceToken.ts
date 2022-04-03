import * as cloudflare from '@pulumi/cloudflare'
import * as zone from './zone'

const githubServiceToken = new cloudflare.AccessServiceToken('github', {
    name: 'GitHub',
    zoneId: zone.andrewmeierDotDevZoneId
})

export const githubServiceTokenId = githubServiceToken.id
export const githubServiceTokenClientId = githubServiceToken.clientId
export const githubServiceTokenClientSecret = githubServiceToken.clientSecret
