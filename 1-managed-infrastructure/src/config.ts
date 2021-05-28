import * as auth0 from '@pulumi/auth0'
import * as cloudflare from '@pulumi/cloudflare'
import * as digitalocean from '@pulumi/digitalocean'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'

export const rootDir = path.dirname(__dirname)

const rawConfig = new pulumi.Config()

export const zone = rawConfig.require('zone')
export const acmeEmail = rawConfig.require('acmeEmail')
export const emailClaim = `https://${zone}/email`
export const publicKey = rawConfig.require('publicKey')

const rawInletsConfig = new pulumi.Config('inlets')
export const inletsConfig = {
    version: '0.8.4',
    license: rawInletsConfig.require('license'),
    token: rawInletsConfig.require('token')
}

const rawCloudflareConfig = new pulumi.Config('cloudflare')
export const cloudflareProvider = new cloudflare.Provider('default', {
    email: rawCloudflareConfig.require('email'),
    apiKey: rawCloudflareConfig.require('apiKey')
})

const rawDigitalOceanConfig = new pulumi.Config('digitalocean')
export const digitalOceanToken = rawDigitalOceanConfig.require('token')
export const digitalOceanProvider = new digitalocean.Provider('default', {
    token: digitalOceanToken,
    spacesEndpoint: `https://nyc3.digitaloceanspaces.com`,
    spacesAccessId: rawDigitalOceanConfig.require('spacesAccessId'),
    spacesSecretKey: rawDigitalOceanConfig.require('spacesSecretKey')
})

const rawAuth0Config = new pulumi.Config('auth0')
export const auth0Config = {
    domain: rawAuth0Config.require('domain'),
    authUrl: `https://${rawAuth0Config.require('domain')}`,
    clientId: rawAuth0Config.require('clientId'),
    clientSecret: rawAuth0Config.require('clientSecret'),
    adminEmail: rawAuth0Config.require('adminEmail'),
    adminPassword: rawAuth0Config.require('adminPassword')
}
export const auth0Provider = new auth0.Provider('default', {
    domain: auth0Config.domain,
    clientId: auth0Config.clientId,
    clientSecret: auth0Config.clientSecret
})
