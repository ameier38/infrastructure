import * as digitalocean from '@pulumi/digitalocean'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'
import * as config from './config'
import { uploadBucket } from './bucket'

const logoKey = 'logo.png'
const logoPath = path.join(config.rootDir, 'images', logoKey)

const logoObject = new digitalocean.SpacesBucketObject('logo', {
    bucket: uploadBucket.name,
    key: logoKey,
    region: 'nyc3',
    source: logoPath,
    acl: 'public-read'
}, { provider: config.digitalOceanProvider })

export const logoUrl = pulumi.interpolate `https://${uploadBucket.bucketDomainName}/${logoObject.key}`
