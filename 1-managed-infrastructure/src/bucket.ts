import * as digitalocean from '@pulumi/digitalocean'
import * as config from './config'

export const uploadBucket = new digitalocean.SpacesBucket('upload', {
    acl: 'public-read',
    region: 'nyc3'
}, { provider: config.digitalOceanProvider })
