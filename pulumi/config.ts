import * as auth0 from '@pulumi/auth0'
import * as cloudflare from '@pulumi/cloudflare'
import * as digitalocean from '@pulumi/digitalocean'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'

export const root = path.dirname(path.dirname(__dirname))

export const env = pulumi.getStack()

export const zone = 'andrewmeier.dev'

export const emailClaim = `https://${zone}/email`

const rawCloudflareConfig = new pulumi.Config('cloudflare')
export const cloudflareProvider = new cloudflare.Provider(`${env}-cloudflare-provider`, {
    email: rawCloudflareConfig.require('email'),
    apiKey: rawCloudflareConfig.require('apiKey')
})

const rawDigitalOceanConfig = new pulumi.Config('digitalocean')
export const digitalOceanProvider = new digitalocean.Provider(`${env}-digitalocean-provider`, {
    token: rawDigitalOceanConfig.require('token'),
    spacesEndpoint: `https://${digitalocean.Regions.NYC3}.digitaloceanspaces.com`,
    spacesAccessId: rawDigitalOceanConfig.require('spacesAccessId'),
    spacesSecretKey: rawDigitalOceanConfig.require('spacesSecretKey')
})

const rawAcmeConfig = new pulumi.Config('acme')
export const acmeEmail = rawAcmeConfig.require('email')

const rawAuth0Config = new pulumi.Config('auth0')
export const auth0Config = {
    domain: rawAuth0Config.require('domain'),
    authUrl: `https://${rawAuth0Config.require('domain')}`,
    clientId: rawAuth0Config.require('clientId'),
    clientSecret: rawAuth0Config.require('clientSecret'),
    adminEmail: rawAuth0Config.require('adminEmail'),
    adminPassword: rawAuth0Config.require('adminPassword')
}
export const auth0Provider = new auth0.Provider(`${env}-auth0-provider`, {
    domain: auth0Config.domain,
    clientId: auth0Config.clientId,
    clientSecret: auth0Config.clientSecret
})

const rawGrafanaConfig = new pulumi.Config('grafana')
export const grafanaConfig = {
    adminPassword: rawGrafanaConfig.require('adminPassword')
}
