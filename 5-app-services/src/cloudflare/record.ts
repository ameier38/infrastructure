import * as cloudflare from '@pulumi/cloudflare'
import * as config from '../config'

export const traefikRecord = new cloudflare.Record('traefik.andrewmeier.dev', {
    zoneId: config.andrewmeierDotDevZoneId,
    name: 'traefik',
    type: 'CNAME',
    value: config.k8sTunnelHost,
    proxied: true
})

export const whoamiRecord = new cloudflare.Record('whoami.andrewmeier.dev', {
    zoneId: config.andrewmeierDotDevZoneId,
    name: 'whoami',
    type: 'CNAME',
    value: config.k8sTunnelHost,
    proxied: true
})

export const andrewmeierRecord = new cloudflare.Record('andrewmeier.dev', {
    zoneId: config.andrewmeierDotDevZoneId,
    name: '@',
    type: 'CNAME',
    value: config.k8sTunnelHost,
    proxied: true
})

export const meiermadeRecord = new cloudflare.Record('meiermade.com', {
    zoneId: config.meiermadeDotComZoneId,
    name: '@',
    type: 'CNAME',
    value: config.k8sTunnelHost,
    proxied: true
})
