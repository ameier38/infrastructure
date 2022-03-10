import * as cloudflare from '@pulumi/cloudflare'
import * as tunnel from './tunnel'
import * as zone from './zone'

const sendgridRecords = {
    'em3414': 'u25842482.wl233.sendgrid.net',
    's1._domainkey': 's1.domainkey.u25842482.wl233.sendgrid.net',
    's2._domainkey': 's2.domainkey.u25842482.wl233.sendgrid.net'
}

for (const [key, value] of Object.entries(sendgridRecords)) {
    new cloudflare.Record(`${key}.andrewmeier.dev`, {
        zoneId: zone.andrewmeierDotDevZoneId,
        name: key,
        type: 'CNAME',
        value: value
    })
}

const k8sApiRecord = new cloudflare.Record('k8s.andrewmeier.dev', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: 'k8s',
    type: 'CNAME',
    value: tunnel.k8sApiTunnelHost,
    proxied: true
})

export const k8sApiHostname = k8sApiRecord.hostname
