import * as pulumi from '@pulumi/pulumi'

export const srcDir = __dirname

const managedInfrastructureStack = new pulumi.StackReference('ameier38/managed-infrastructure/prod')

export const logoUrl = managedInfrastructureStack.requireOutput('logoUrl')
export const githubIdentityProviderId = managedInfrastructureStack.requireOutput('githubIdentityProviderId')
export const andrewmeierDotDevDomain = managedInfrastructureStack.requireOutput('andrewmeierDotDevDomain')
export const meiermadeDotComDomain = managedInfrastructureStack.requireOutput('meiermadeDotComDomain')
export const k8sTunnelId = managedInfrastructureStack.requireOutput('k8sTunnelId')
export const k8sTunnelToken = managedInfrastructureStack.requireOutput('k8sTunnelToken')
export const originCertificate = managedInfrastructureStack.requireOutput('originCertificate')
export const originPrivateKey = managedInfrastructureStack.requireOutput('originPrivateKey')
