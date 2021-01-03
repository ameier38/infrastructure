import * as auth0 from '@pulumi/auth0'
import * as cloudflare from '@pulumi/cloudflare'
import * as digitalocean from '@pulumi/digitalocean'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'

export const pulumiRoot = path.dirname(__dirname)
export const root = path.dirname(pulumiRoot)

export const env = pulumi.getStack()

const rawConfig = new pulumi.Config()

export const zone = 'andrewmeier.dev'

export const acmeEmail = rawConfig.require('acmeEmail')
export const emailClaim = `https://${zone}/email`

const rawK8sConfig = new pulumi.Config('k8s')
export const kubeconfig = rawK8sConfig.require('kubeconfig')

export const k8sProvider = new k8s.Provider(`${env}-k8s-provider`, {
    kubeconfig: kubeconfig,
    suppressDeprecationWarnings: true
})

const rawInletsConfig = new pulumi.Config('inlets')
export const inletsConfig = {
    license: rawInletsConfig.require('license'),
    token: rawInletsConfig.require('token'),
    publicKey: rawInletsConfig.require('publicKey')
}

const rawCloudflareConfig = new pulumi.Config('cloudflare')
export const cloudflareProvider = new cloudflare.Provider(`${env}-cloudflare-provider`, {
    email: rawCloudflareConfig.require('email'),
    apiKey: rawCloudflareConfig.require('apiKey')
})

const rawDigitalOceanConfig = new pulumi.Config('digitalocean')
export const digitalOceanToken = rawDigitalOceanConfig.require('token')
export const digitalOceanProvider = new digitalocean.Provider(`${env}-digitalocean-provider`, {
    token: digitalOceanToken,
    spacesEndpoint: `https://${digitalocean.Regions.NYC3}.digitaloceanspaces.com`,
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
export const auth0Provider = new auth0.Provider(`${env}-auth0-provider`, {
    domain: auth0Config.domain,
    clientId: auth0Config.clientId,
    clientSecret: auth0Config.clientSecret
})

const rawGrafanaConfig = new pulumi.Config('grafana')
export const grafanaConfig = {
    adminPassword: rawGrafanaConfig.require('adminPassword')
}
