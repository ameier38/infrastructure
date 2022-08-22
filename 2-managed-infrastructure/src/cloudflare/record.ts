import * as cloudflare from '@pulumi/cloudflare'
import * as pulumi from '@pulumi/pulumi'
import * as tunnel from './tunnel'
import * as zone from './zone'
import * as email from '../aws/email'

new cloudflare.Record('ses-verification', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: pulumi.interpolate `_amazonses.${email.identityId}`,
    type: 'TXT',
    value: email.verificationToken,
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

email.dkimTokens.apply((tokens:string[]) => {
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
    value: tunnel.k8sApiTunnel.host,
    proxied: true
})

export const traefikRecord = new cloudflare.Record('traefik.andrewmeier.dev', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: 'traefik',
    type: 'CNAME',
    value: tunnel.k8sTunnel.host,
    proxied: true
})

export const whoamiRecord = new cloudflare.Record('whoami.andrewmeier.dev', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: 'whoami',
    type: 'CNAME',
    value: tunnel.k8sTunnel.host,
    proxied: true
})

export const grafanaRecord = new cloudflare.Record('grafana.andrewmeier.dev', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: 'grafana',
    type: 'CNAME',
    value: tunnel.k8sTunnel.host,
    proxied: true
})

export const andrewmeierRecord = new cloudflare.Record('andrewmeier.dev', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: '@',
    type: 'CNAME',
    value: tunnel.k8sTunnel.host,
    proxied: true
})
