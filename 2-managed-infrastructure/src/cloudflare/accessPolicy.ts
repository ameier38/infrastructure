import * as cloudflare from '@pulumi/cloudflare'
import * as app from './accessApplication'
import { githubServiceToken } from './serviceToken'

const emails = [ 'ameier38@gmail.com' ]

new cloudflare.AccessPolicy('k8s-api-user-access', {
    name: 'Kubernetes API User Access',
    precedence: 1,
    accountId: cloudflare.config.accountId,
    applicationId: app.k8sApi.id,
    decision: 'allow',
    includes: [{
        emails: emails
    }]
})

new cloudflare.AccessPolicy('k8s-api-github-access', {
    name: 'Kubernetes API GitHub Access',
    precedence: 2,
    accountId: cloudflare.config.accountId,
    applicationId: app.k8sApi.id,
    decision: 'non_identity',
    includes: [{
        serviceTokens: [ githubServiceToken.id ]
    }]
})

new cloudflare.AccessPolicy('traefik-user-access', {
    name: 'Traefik User Access',
    precedence: 1,
    accountId: cloudflare.config.accountId,
    applicationId: app.traefik.id,
    decision: 'allow',
    includes: [{
        emails: emails
    }]
})

new cloudflare.AccessPolicy('whoami-user-access', {
    name: 'Whoami User Access',
    precedence: 1,
    accountId: cloudflare.config.accountId,
    applicationId: app.whoami.id,
    decision: 'allow',
    includes: [{
        emails: emails
    }]
})

new cloudflare.AccessPolicy('grafana-user-access', {
    name: 'Grafana User Access',
    precedence: 1,
    accountId: cloudflare.config.accountId,
    applicationId: app.grafana.id,
    decision: 'allow',
    includes: [{
        emails: emails
    }]
})
