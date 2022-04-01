import * as cloudflare from '@pulumi/cloudflare'
import * as application from './accessApplication'
import * as serviceToken from './serviceToken'
import * as zone from './zone'

new cloudflare.AccessPolicy('internal-user-access', {
    name: 'Internal User Access',
    precedence: 0,
    zoneId: zone.andrewmeierDotDevZoneId,
    applicationId: application.internalApplicationId,
    decision: 'allow',
    includes: [{
        emails: [ 'ameier38@gmail.com' ],
    }]
})

new cloudflare.AccessPolicy('internal-bot-access', {
    name: 'Internal Bot Access',
    precedence: 1,
    zoneId: zone.andrewmeierDotDevZoneId,
    applicationId: application.internalApplicationId,
    decision: 'non_identity',
    includes: [{
        serviceTokens: [ serviceToken.githubServiceTokenId ]
    }]
})
