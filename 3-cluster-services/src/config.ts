import * as cloudflare from '@pulumi/cloudflare'
import * as digitalocean from '@pulumi/digitalocean'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'

export const rootDir = path.dirname(__dirname)

const env = pulumi.getStack()

const managedInfrastructureStack = new pulumi.StackReference(`ameier38/managed-infrastructure/${env}`)
const clusterStack = new pulumi.StackReference(`ameier38/cluster/${env}`)

export const zone = managedInfrastructureStack.requireOutput('zone')
export const zoneId = managedInfrastructureStack.requireOutput('zoneId')
export const authUrl = managedInfrastructureStack.requireOutput('authUrl')
export const acmeEmail = managedInfrastructureStack.requireOutput('acmeEmail')
export const emailClaim = managedInfrastructureStack.requireOutput('emailClaim')

const kubeconfig = clusterStack.requireOutput('kubeconfig').apply(o => o as string) 

export const k8sProvider = new k8s.Provider('default', {
    kubeconfig: kubeconfig,
    suppressDeprecationWarnings: true
})

const rawInletsConfig = new pulumi.Config('inlets')
export const inletsConfig = {
    version: '0.8.5',
    license: rawInletsConfig.requireSecret('license'),
    token: rawInletsConfig.requireSecret('token')
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
