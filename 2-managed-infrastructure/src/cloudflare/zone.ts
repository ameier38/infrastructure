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

const meiermadeDotCom = new cloudflare.Zone('meiermade.com', {
    zone: 'meiermade.com'
}, { import: '2ab0669f80cdb97b14e5e77a85686803'})

new cloudflare.ZoneSettingsOverride('meiermade.com', {
    zoneId: meiermadeDotCom.id,
    settings: {
        ssl: 'strict'
    }
})

export const meiermadeDotComZoneId = meiermadeDotCom.id
export const meiermadeDotComDomain = meiermadeDotCom.zone
