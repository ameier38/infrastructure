import * as pulumi from '@pulumi/pulumi'
import * as digitalocean from '@pulumi/digitalocean'
import * as config from './config'
import * as path from 'path'

const amIconPath = path.join(__dirname, 'etc', 'images', 'am-icon-938123e000.png')

const uploadBucket = new digitalocean.SpacesBucket('upload', {
    acl: 'public-read'
}, { provider: config.digitalOceanProvider })

const amIconObject = new digitalocean.SpacesBucketObject('am-icon', {
    bucket: uploadBucket.name,
    region: digitalocean.Regions.NYC3,
    key: 'am-icon.png',
    source: amIconPath,
    acl: 'public-read'
}, { provider: config.digitalOceanProvider })

export const amIconUrl = pulumi.interpolate `https://${uploadBucket.bucketDomainName}/${amIconObject.key}`
