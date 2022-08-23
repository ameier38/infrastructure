import * as pulumi from '@pulumi/pulumi'

const identityStack = new pulumi.StackReference('ameier38/identity/prod')
const managedInfrastructureStack = new pulumi.StackReference('ameier38/managed-infrastructure/prod')
const clusterServicesStack = new pulumi.StackReference('ameier38/cluster-services/prod')
const appServicesStack = new pulumi.StackReference('ameier38/app-services/prod')

export const smtpUserAccessKeyId = identityStack.getOutput('smtpUserAccessKeyId')
export const smtpUserSmtpPassword = identityStack.getOutput('smtpUserSmtpPassword')
export const githubIdentityProviderId = managedInfrastructureStack.requireOutput('githubIdentityProviderId')
export const monitoringNamespace = clusterServicesStack.requireOutput('monitoringNamespace')
export const prometheusUrl = clusterServicesStack.requireOutput('prometheusUrl')
export const lokiUrl = clusterServicesStack.requireOutput('lokiUrl')
export const traefikHost = appServicesStack.requireOutput('traefikHost')
export const whoamiHost = appServicesStack.requireOutput('whoamiHost')
export const grafanaHost = appServicesStack.requireOutput('grafanaHost')

const rawConfig = new pulumi.Config()
export const email = rawConfig.requireSecret('email')
