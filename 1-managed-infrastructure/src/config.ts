import * as auth0 from '@pulumi/auth0'
import * as cloudflare from '@pulumi/cloudflare'
import * as digitalocean from '@pulumi/digitalocean'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'

export const rootDir = path.dirname(__dirname)

const rawConfig = new pulumi.Config()

export const zone = rawConfig.require('zone')
export const acmeEmail = rawConfig.requireSecret('acmeEmail')
export const emailClaim = `https://${zone}/email`

const rawCloudflareConfig = new pulumi.Config('cloudflare')
export const cloudflareProvider = new cloudflare.Provider('default', {
    email: rawCloudflareConfig.requireSecret('email'),
    apiKey: rawCloudflareConfig.requireSecret('apiKey')
})

const rawDigitalOceanConfig = new pulumi.Config('digitalocean')
export const digitalOceanToken = rawDigitalOceanConfig.requireSecret('token')
export const digitalOceanProvider = new digitalocean.Provider('default', {
    token: digitalOceanToken,
    spacesEndpoint: `https://nyc3.digitaloceanspaces.com`,
    spacesAccessId: rawDigitalOceanConfig.requireSecret('spacesAccessId'),
    spacesSecretKey: rawDigitalOceanConfig.requireSecret('spacesSecretKey')
})

const rawAuth0Config = new pulumi.Config('auth0')
export const auth0Config = {
    domain: rawAuth0Config.require('domain'),
    authUrl: `https://${rawAuth0Config.require('domain')}`,
    clientId: rawAuth0Config.require('clientId'),
    clientSecret: rawAuth0Config.requireSecret('clientSecret'),
    adminEmail: rawAuth0Config.requireSecret('adminEmail'),
    adminPassword: rawAuth0Config.requireSecret('adminPassword')
}
export const auth0Provider = new auth0.Provider('default', {
    domain: auth0Config.domain,
    clientId: auth0Config.clientId,
    clientSecret: auth0Config.clientSecret
})
