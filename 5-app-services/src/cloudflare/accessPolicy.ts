import * as cloudflare from '@pulumi/cloudflare'
import * as app from './accessApplication'
import * as config from '../config'

new cloudflare.AccessPolicy('traefik-user-access', {
    name: 'Traefik User Access',
    precedence: 1,
    accountId: config.cloudflareAccountId,
    applicationId: app.traefik.id,
    decision: 'allow',
    includes: [{
        emails: [ config.email ]
    }]
})

new cloudflare.AccessPolicy('whoami-user-access', {
    name: 'Whoami User Access',
    precedence: 1,
    accountId: config.cloudflareAccountId,
    applicationId: app.whoami.id,
    decision: 'allow',
    includes: [{
        emails: [ config.email ]
    }]
})
