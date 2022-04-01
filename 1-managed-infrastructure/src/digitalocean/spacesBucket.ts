import * as digitalocean from '@pulumi/digitalocean'

const bucket = new digitalocean.SpacesBucket('default', {
    acl: 'public-read',
    region: 'nyc3'
})

export const bucketName = bucket.name
export const bucketDomainName = bucket.bucketDomainName
