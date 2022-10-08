import * as pulumi from '@pulumi/pulumi'

export const srcDir = __dirname

const managedInfrastructureStack = new pulumi.StackReference('ameier38/managed-infrastructure/prod')

export const logoUrl = managedInfrastructureStack.requireOutput('logoUrl')
export const githubIdentityProviderId = managedInfrastructureStack.requireOutput('githubIdentityProviderId')
export const andrewmeierDotDevDomain = managedInfrastructureStack.requireOutput('andrewmeierDotDevDomain')

const rawConfig = new pulumi.Config()
export const cloudflareApiKey = rawConfig.requireSecret('cloudflareApiKey')
export const cloudflareOriginCaKey = rawConfig.requireSecret('cloudflareOriginCaKey') 
