import * as cloudflare from '@pulumi/cloudflare'
import * as app from './accessApplication'
import { githubServiceToken } from './serviceToken'
import { email, cloudflareAccountId } from '../config'

new cloudflare.AccessPolicy('k8s-api-user-access', {
    name: 'Kubernetes API User Access',
    precedence: 1,
    accountId: cloudflareAccountId,
    applicationId: app.k8sApi.id,
    decision: 'allow',
    includes: [{
        emails: [ email ]
    }]
})

new cloudflare.AccessPolicy('k8s-api-github-access', {
    name: 'Kubernetes API GitHub Access',
    precedence: 2,
    accountId: cloudflareAccountId,
    applicationId: app.k8sApi.id,
    decision: 'non_identity',
    includes: [{
        serviceTokens: [ githubServiceToken.id ]
    }]
})
