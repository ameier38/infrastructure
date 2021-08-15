import * as digitalocean from '@pulumi/digitalocean'
import * as pulumi from '@pulumi/pulumi'

const rawConfig = new pulumi.Config()

export const publicKey = rawConfig.requireSecret('publicKey')
export const privateKey = rawConfig.requireSecret('privateKey')

const rawDigitalOceanConfig = new pulumi.Config('digitalocean')
export const digitalOceanProvider = new digitalocean.Provider('default', {
    token: rawDigitalOceanConfig.requireSecret('token')
})
