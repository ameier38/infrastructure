import * as cloudflare from '@pulumi/cloudflare'

const andrewmeierDotDev = new cloudflare.Zone('andrewmeier.dev', {
    zone: 'andrewmeier.dev'
})

new cloudflare.ZoneSettingsOverride('andrewmeier.dev', {
    zoneId: andrewmeierDotDev.id,
    settings: {
        ssl: 'strict'
    }
})

export const andrewmeierDotDevZoneId = andrewmeierDotDev.id
export const andrewmeierDotDevDomain = andrewmeierDotDev.zone
