import * as cloudflare from '@pulumi/cloudflare'
import * as pulumi from '@pulumi/pulumi'
import * as tunnel from './tunnel'
import * as zone from './zone'
import * as email from '../aws/email'

new cloudflare.Record('ses-verification', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: pulumi.interpolate `_amazonses.${email.andrewmeierDotDevDomainVerification.identityId}`,
    type: 'TXT',
    value: email.andrewmeierDotDevDomainVerification.verificationToken,
    ttl: 600
})

// Needed for custom mail from
new cloudflare.Record('ses-feedback', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: 'ses',
    type: 'MX',
    value: 'feedback-smtp.us-east-1.amazonses.com',
    priority: 10
})

// Needed for custom mail from
new cloudflare.Record('ses-spf', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: 'ses',
    type: 'TXT',
    value: 'v=spf1 include:amazonses.com ~all'
})

email.andrewmeierDotDevDomainVerification.dkimTokens.apply((tokens:string[]) => {
    for (let idx = 0; idx < tokens.length; idx++) {
        new cloudflare.Record(`ses-dkim-${idx}`, {
            zoneId: zone.andrewmeierDotDevZoneId,
            name: `${tokens[idx]}._domainkey`,
            type: 'CNAME',
            value: `${tokens[idx]}.dkim.amazonses.com`
        })
    }
})

export const k8sApiRecord = new cloudflare.Record('k8s.andrewmeier.dev', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: 'k8s',
    type: 'CNAME',
    value: tunnel.k8sApiTunnel.cname,
    proxied: true
})
