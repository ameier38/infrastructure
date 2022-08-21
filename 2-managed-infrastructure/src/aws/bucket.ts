import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'
import * as config from '../config'

const publicBucket = new aws.s3.Bucket('ameier38-public', {
    bucket: 'ameier38-public',
    acl: 'public-read'
})

const logoPath = path.join(config.rootDir, 'images', 'logo.png')

const logo = new aws.s3.BucketObjectv2('logo', {
    bucket: publicBucket.id,
    key: 'logo.png',
    source: new pulumi.asset.FileAsset(logoPath)
})

export const logoUrl = pulumi.interpolate`https://${publicBucket.bucket}.s3.amazonaws.com/${logo.key}`
