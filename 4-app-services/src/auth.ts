import * as cloudflare from '@pulumi/cloudflare'
import * as config from './config'

const grafanaApplication = new cloudflare.AccessApplication('grafana.andrewmeier.dev', {
    name: 'Grafana',
    domain: 'grafana.andrewmeier.dev',
    zoneId: config.andrewmeierDotDevZoneId,
    allowedIdps: [ config.githubIdentityProviderId ],
    autoRedirectToIdentity: true,
    logoUrl: config.logoUrl,
    type: 'self_hosted'
})

new cloudflare.AccessPolicy('grafana.andrewmeier.dev', {
    name: 'Grafana Access',
    precedence: 1,
    zoneId: config.andrewmeierDotDevZoneId,
    applicationId: grafanaApplication.id,
    decision: 'allow',
    includes: [{
        emails: ['ameier38@gmail.com']
    }]
})
