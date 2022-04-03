import * as pulumi from '@pulumi/pulumi'

export const srcDir = __dirname

const managedInfrastructureStack = new pulumi.StackReference('ameier38/managed-infrastructure/prod')

export const k8sTunnelId = managedInfrastructureStack.requireOutput('k8sTunnelId')
export const k8sTunnelCredentials = managedInfrastructureStack.requireOutput('k8sTunnelCredentials')
export const registryServer = managedInfrastructureStack.requireOutput('registryServer')
export const registryName = managedInfrastructureStack.requireOutput('registryName')
export const registryUser = managedInfrastructureStack.requireOutput('registryUser')
export const registryPassword = managedInfrastructureStack.requireOutput('registryPassword')
export const dockerconfigjson = managedInfrastructureStack.requireOutput('dockerconfigjson')
export const andrewmeierDotDevDomain = managedInfrastructureStack.requireOutput('andrewmeierDotDevDomain')
export const traefikHost = managedInfrastructureStack.requireOutput('traefikHost')
