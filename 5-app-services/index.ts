import './src/cloudflare'
import * as record from './src/cloudflare/record'

export const traefikHost = record.traefikRecord.hostname
export const whoamiHost = record.whoamiRecord.hostname
export const blogHost = record.andrewmeierRecord.hostname
export const meiermadeHost = record.meiermadeRecord.hostname
