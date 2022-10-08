import * as cloudflare from '@pulumi/cloudflare'
import { githubIdentityProvider } from './accessIdentityProvider'
import { k8sApiRecord } from './record'

export const k8sApi = new cloudflare.AccessApplication('k8s-api', {
    name: 'Kubernetes API',
    domain: k8sApiRecord.hostname,
    accountId: cloudflare.config.accountId,
    allowedIdps: [ githubIdentityProvider.id ],
    autoRedirectToIdentity: true,
    type: 'self_hosted',
    httpOnlyCookieAttribute: true
})
