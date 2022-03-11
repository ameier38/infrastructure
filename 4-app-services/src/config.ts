import * as docker from '@pulumi/docker'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'

export const rootDir = path.dirname(__dirname)

const managedInfrastructureStack = new pulumi.StackReference('ameier38/managed-infrastructure/prod')
const clusterServicesStack = new pulumi.StackReference('ameier38/cluster-services/prod')

export const logoUrl = managedInfrastructureStack.requireOutput('logoUrl')
export const tunnelId = managedInfrastructureStack.requireOutput('k8sTunnelId')
export const tunnelHost = managedInfrastructureStack.requireOutput('k8sTunnelHost')
export const tunnelCredentials = managedInfrastructureStack.requireOutput('k8sTunnelCredentials')
export const imageRegistry = managedInfrastructureStack.requireOutput('imageRegistry').apply(o => o as docker.ImageRegistry)
export const registryEndpoint = managedInfrastructureStack.requireOutput('registryEndpoint').apply(o => o as string)
export const dockerCredentials = managedInfrastructureStack.requireOutput('dockerCredentials').apply(o => o as string)
export const githubIdentityProviderId = managedInfrastructureStack.requireOutput('githubIdentityProviderId')
export const andrewmeierDotDevZoneId = managedInfrastructureStack.requireOutput('andrewmeierDotDevZoneId')

export const cloudflaredNamespace = clusterServicesStack.requireOutput('cloudflaredNamespace')
