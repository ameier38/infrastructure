import * as digitalocean from '@pulumi/digitalocean'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'
import * as config from './config'

const bucket = new digitalocean.SpacesBucket('default', {
    acl: 'public-read',
    region: 'nyc3'
})

const logoKey = 'logo.png'
const logoPath = path.join(config.rootDir, 'images', logoKey)

const logoObject = new digitalocean.SpacesBucketObject('logo', {
    bucket: bucket.name,
    key: logoKey,
    region: 'nyc3',
    source: logoPath,
    acl: 'public-read'
})

export const logoUrl = pulumi.interpolate `https://${bucket.bucketDomainName}/${logoObject.key}`
