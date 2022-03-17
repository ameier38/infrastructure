import * as cloudflare from '@pulumi/cloudflare'
import * as bucket from './bucket'
import * as identityProvider from './identityProvider'
import * as zone from './zone'

const githubServiceToken = new cloudflare.AccessServiceToken('github', {
    name: 'GitHub',
    zoneId: zone.andrewmeierDotDevZoneId
})

export const githubServiceTokenClientId = githubServiceToken.clientId
export const githubServiceTokenClientSecret = githubServiceToken.clientSecret

const k8sApiApplication = new cloudflare.AccessApplication('k8s.andrewmeier.dev', {
    name: 'Kubernetes API',
    domain: 'k8s.andrewmeier.dev',
    zoneId: zone.andrewmeierDotDevZoneId,
    allowedIdps: [ identityProvider.githubIdentityProviderId ],
    autoRedirectToIdentity: true,
    logoUrl: bucket.logoUrl,
    type: 'self_hosted'
})

new cloudflare.AccessPolicy('k8s.andrewmeier.dev', {
    name: 'Kubernetes API Access',
    precedence: 0,
    zoneId: zone.andrewmeierDotDevZoneId,
    applicationId: k8sApiApplication.id,
    decision: 'allow',
    includes: [{
        emails: [ 'ameier38@gmail.com' ],
        serviceTokens: [ githubServiceToken.id ]
    }]
})
