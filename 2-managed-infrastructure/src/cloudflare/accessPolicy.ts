import * as cloudflare from '@pulumi/cloudflare'
import * as app from './accessApplication'
import { githubServiceToken } from './serviceToken'

new cloudflare.AccessPolicy('k8s-api-user-access', {
    name: 'Kubernetes API User Access',
    precedence: 1,
    accountId: cloudflare.config.accountId,
    applicationId: app.k8sApi.id,
    decision: 'allow',
    includes: [{
        emails: [ 'ameier38@gmail.com' ]
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
