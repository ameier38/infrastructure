import * as pulumi from '@pulumi/pulumi'

const managedInfrastructureStack = new pulumi.StackReference('ameier38/managed-infrastructure/prod')

export const andrewmeierDotDevZoneId = managedInfrastructureStack.requireOutput('andrewmeierDotDevZoneId')
export const meiermadeDotComZoneId = managedInfrastructureStack.requireOutput('meiermadeDotComZoneId')
export const githubIdentityProviderId = managedInfrastructureStack.requireOutput('githubIdentityProviderId')
export const logoUrl = managedInfrastructureStack.requireOutput('logoUrl')
export const k8sTunnelHost = managedInfrastructureStack.requireOutput('k8sTunnelHost')

const rawConfig = new pulumi.Config()
export const email = rawConfig.requireSecret('email')
export const cloudflareAccountId= rawConfig.requireSecret('cloudflareAccountId')
