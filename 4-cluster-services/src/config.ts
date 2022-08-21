import * as pulumi from '@pulumi/pulumi'

export const srcDir = __dirname

const managedInfrastructureStack = new pulumi.StackReference('ameier38/managed-infrastructure/prod')

export const k8sTunnelId = managedInfrastructureStack.requireOutput('k8sTunnelId')
export const k8sTunnelCredentials = managedInfrastructureStack.requireOutput('k8sTunnelCredentials')
export const andrewmeierDotDevDomain = managedInfrastructureStack.requireOutput('andrewmeierDotDevDomain')
export const traefikHost = managedInfrastructureStack.requireOutput('traefikHost')
