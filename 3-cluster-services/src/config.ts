import * as auth0 from '@pulumi/auth0'
import * as cloudflare from '@pulumi/cloudflare'
import * as digitalocean from '@pulumi/digitalocean'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'

export const rootDir = path.dirname(__dirname)

const env = pulumi.getStack()

const managedInfrastructureStack = new pulumi.StackReference(`ameier38/managed-infrastructure/${env}`)

const rawConfig = new pulumi.Config()

export const zone = managedInfrastructureStack.requireOutput('zone')
export const zoneId = managedInfrastructureStack.requireOutput('zoneId')
export const exitNodeIp = managedInfrastructureStack.requireOutput('exitNodeIp')
export const authUrl = managedInfrastructureStack.requireOutput('authUrl')
export const acmeEmail = managedInfrastructureStack.requireOutput('acmeEmail')
export const emailClaim = managedInfrastructureStack.requireOutput('emailClaim')

const rawK8sConfig = new pulumi.Config('k8s')
export const kubeconfig = rawK8sConfig.require('kubeconfig')
export const k8sProvider = new k8s.Provider('default', {
    kubeconfig: kubeconfig,
    suppressDeprecationWarnings: true
})

export const inletsConfig = {
    version: managedInfrastructureStack.requireOutput('inletsVersion'),
    license: managedInfrastructureStack.requireOutput('inletsLicense'),
    token: managedInfrastructureStack.requireOutput('inletsToken')
}

export const gatewayConfig = {
    clientId: managedInfrastructureStack.requireOutput('gatewayClientId'),
    clientSecret: managedInfrastructureStack.requireOutput('gatewayClientSecret'),
    clientAudience: managedInfrastructureStack.requireOutput('gatewayClientAudience')
}

const rawCloudflareConfig = new pulumi.Config('cloudflare')
export const cloudflareProvider = new cloudflare.Provider('default', {
    email: rawCloudflareConfig.require('email'),
    apiKey: rawCloudflareConfig.require('apiKey')
})

const rawGrafanaConfig = new pulumi.Config('grafana')
export const grafanaConfig = {
    adminPassword: rawGrafanaConfig.require('adminPassword')
}
