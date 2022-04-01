import * as pulumi from '@pulumi/pulumi'

export const srcDir = __dirname

const managedInfrastructureStack = new pulumi.StackReference('ameier38/managed-infrastructure/prod')
const clusterServicesStack = new pulumi.StackReference('ameier38/cluster-services/prod')

export const logoUrl = managedInfrastructureStack.requireOutput('logoUrl')
export const k8sTunnelId = managedInfrastructureStack.requireOutput('k8sTunnelId')
export const k8sTunnelHost = managedInfrastructureStack.requireOutput('k8sTunnelHost')
export const k8sTunnelCredentials = managedInfrastructureStack.requireOutput('k8sTunnelCredentials')
export const registryServer = managedInfrastructureStack.requireOutput('registryServer')
export const registryName = managedInfrastructureStack.requireOutput('registryName')
export const registryUser = managedInfrastructureStack.requireOutput('registryUser')
export const registryPassword = managedInfrastructureStack.requireOutput('registryPassword')
export const dockerCredentials = managedInfrastructureStack.requireOutput('dockerCredentials').apply(o => o as string)
export const andrewmeierDotDevZoneId = managedInfrastructureStack.requireOutput('andrewmeierDotDevZoneId')

export const cloudflaredNamespace = clusterServicesStack.requireOutput('cloudflaredNamespace')
