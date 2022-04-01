import * as cloudflare from '@pulumi/cloudflare'

const andrewmeierDotDev = new cloudflare.Zone('andrewmeier.dev', {
    zone: 'andrewmeier.dev'
})

new cloudflare.ZoneSettingsOverride('andrewmeier.dev', {
    zoneId: andrewmeierDotDev.id,
    settings: {
        alwaysUseHttps: 'on'
    }
})

export const andrewmeierDotDevZoneId = andrewmeierDotDev.id
