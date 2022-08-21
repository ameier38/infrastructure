import * as cloudflare from '@pulumi/cloudflare'
import { logoUrl } from '../aws/bucket'
import * as identityProvider from './accessIdentityProvider'

const internalApplication = new cloudflare.AccessApplication('internal', {
    name: 'Internal',
    domain: '*.andrewmeier.dev',
    accountId: cloudflare.config.accountId,
    allowedIdps: [ identityProvider.githubIdentityProviderId ],
    autoRedirectToIdentity: true,
    logoUrl: logoUrl,
    type: 'self_hosted',
    httpOnlyCookieAttribute: false
})

export const internalApplicationId = internalApplication.id
