import * as digitalocean from '@pulumi/digitalocean'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'
import * as config from '../config'
import * as bucket from './spacesBucket'

const logoKey = 'logo.png'
const logoPath = path.join(config.rootDir, 'images', logoKey)

const logoObject = new digitalocean.SpacesBucketObject('logo', {
    bucket: bucket.bucketName,
    key: logoKey,
    region: 'nyc3',
    source: logoPath,
    acl: 'public-read'
})

export const logoUrl = pulumi.interpolate `https://${bucket.bucketDomainName}/${logoObject.key}`
