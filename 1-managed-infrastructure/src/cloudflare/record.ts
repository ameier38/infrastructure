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

const k8sApiTunnel = new cloudflare.Record('k8s.andrewmeier.dev', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: 'k8s',
    type: 'CNAME',
    value: tunnel.k8sApiTunnelHost,
    proxied: true
})

export const k8sApiTunnelHost = k8sApiTunnel.hostname

const traefikDotAndrewmeierDotDev = new cloudflare.Record('traefik.andrewmeier.dev', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: 'traefik',
    type: 'CNAME',
    value: tunnel.k8sTunnelHost,
    proxied: true
})

export const traefikHost = traefikDotAndrewmeierDotDev.hostname

const whoamiDotAndrewmeierDotDev = new cloudflare.Record('whoami.andrewmeier.dev', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: 'whoami',
    type: 'CNAME',
    value: tunnel.k8sTunnelHost,
    proxied: true
})

export const whoamiHost = whoamiDotAndrewmeierDotDev.hostname

const grafanaDotAndrewmeierDotDev = new cloudflare.Record('grafana.andrewmeier.dev', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: 'grafana',
    type: 'CNAME',
    value: tunnel.k8sTunnelHost,
    proxied: true
})

export const grafanaHost = grafanaDotAndrewmeierDotDev.hostname

const andrewmeierDotDev = new cloudflare.Record('andrewmeier.dev', {
    zoneId: zone.andrewmeierDotDevZoneId,
    name: '@',
    type: 'CNAME',
    value: tunnel.k8sTunnelHost,
    proxied: true
})

export const blogHost = andrewmeierDotDev.hostname
