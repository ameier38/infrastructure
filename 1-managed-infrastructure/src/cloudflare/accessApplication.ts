import * as cloudflare from '@pulumi/cloudflare'
import * as bucketObject from '../digitalocean/spacesBucketObject'
import * as identityProvider from './accessIdentityProvider'
import * as zone from './zone'

const internalApplication = new cloudflare.AccessApplication('internal', {
    name: 'Internal',
    domain: '*.andrewmeier.dev',
    zoneId: zone.andrewmeierDotDevZoneId,
    allowedIdps: [ identityProvider.githubIdentityProviderId ],
    autoRedirectToIdentity: true,
    logoUrl: bucketObject.logoUrl,
    type: 'self_hosted'
})

export const internalApplicationId = internalApplication.id
