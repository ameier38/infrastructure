import * as cloudflare from '@pulumi/cloudflare'
import * as config from './config'

const andrewmeierDotDev = new cloudflare.Record('andrewmeier.dev', {
    zoneId: config.andrewmeierDotDevZoneId,
    name: '@',
    type: 'CNAME',
    value: config.tunnelHost,
    proxied: true
})

export const andrewmeierDotDevHostname = andrewmeierDotDev.hostname

const grafanaDotAndrewmeierDotDev = new cloudflare.Record('grafana.andrewmeier.dev', {
    zoneId: config.andrewmeierDotDevZoneId,
    name: 'grafana',
    type: 'CNAME',
    value: config.tunnelHost,
    proxied: true
})

export const grafanaDotAndrewmeierDotDevHostname = grafanaDotAndrewmeierDotDev.hostname
