import * as cloudflare from '@pulumi/cloudflare'
import * as application from './accessApplication'
import * as serviceToken from './serviceToken'

new cloudflare.AccessPolicy('internal-user-access', {
    name: 'Internal User Access',
    precedence: 1,
    accountId: cloudflare.config.accountId,
    applicationId: application.internalApplicationId,
    decision: 'allow',
    includes: [{
        emails: [ 'ameier38@gmail.com' ],
    }]
})

new cloudflare.AccessPolicy('internal-bot-access', {
    name: 'Internal Bot Access',
    precedence: 2,
    accountId: cloudflare.config.accountId,
    applicationId: application.internalApplicationId,
    decision: 'non_identity',
    includes: [{
        serviceTokens: [ serviceToken.githubServiceTokenId ]
    }]
})
