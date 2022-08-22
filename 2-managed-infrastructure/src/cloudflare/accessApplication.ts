import * as cloudflare from '@pulumi/cloudflare'
import { logoUrl } from '../aws/bucket'
import * as record from './record'
import { githubIdentityProvider } from './accessIdentityProvider'

export const k8sApi = new cloudflare.AccessApplication('k8s-api', {
    name: 'Kubernetes API',
    domain: record.k8sApiRecord.hostname,
    accountId: cloudflare.config.accountId,
    type: 'self_hosted'
})

export const traefik = new cloudflare.AccessApplication('traefik', {
    name: 'Traefik',
    domain: record.traefikRecord.hostname,
    allowedIdps: [ githubIdentityProvider.id ],
    autoRedirectToIdentity: true,
    accountId: cloudflare.config.accountId,
    logoUrl: logoUrl
})

export const whoami = new cloudflare.AccessApplication('whoami', {
    name: 'Whoami',
    domain: record.whoamiRecord.hostname,
    allowedIdps: [ githubIdentityProvider.id ],
    autoRedirectToIdentity: true,
    accountId: cloudflare.config.accountId,
    logoUrl: logoUrl
})

export const grafana = new cloudflare.AccessApplication('grafana', {
    name: 'Grafana',
    domain: record.grafanaRecord.hostname,
    allowedIdps: [ githubIdentityProvider.id ],
    autoRedirectToIdentity: true,
    accountId: cloudflare.config.accountId,
    logoUrl: logoUrl
})
