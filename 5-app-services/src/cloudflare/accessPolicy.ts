import * as cloudflare from '@pulumi/cloudflare'
import * as app from './accessApplication'
import * as config from '../config'

new cloudflare.AccessPolicy('traefik-user-access', {
    name: 'Traefik User Access',
    precedence: 1,
    accountId: cloudflare.config.accountId,
    applicationId: app.traefik.id,
    decision: 'allow',
    includes: [{
        emails: [ config.email ]
    }]
})

new cloudflare.AccessPolicy('whoami-user-access', {
    name: 'Whoami User Access',
    precedence: 1,
    accountId: cloudflare.config.accountId,
    applicationId: app.whoami.id,
    decision: 'allow',
    includes: [{
        emails: [ config.email ]
    }]
})

new cloudflare.AccessPolicy('grafana-user-access', {
    name: 'Grafana User Access',
    precedence: 1,
    accountId: cloudflare.config.accountId,
    applicationId: app.grafana.id,
    decision: 'allow',
    includes: [{
        emails: [ config.email ]
    }]
})
