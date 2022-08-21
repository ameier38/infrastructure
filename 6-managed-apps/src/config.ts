import * as pulumi from '@pulumi/pulumi'

const identityStack = new pulumi.StackReference('ameier38/identity/prod')
const managedInfrastructureStack = new pulumi.StackReference('ameier38/managed-infrastructure/prod')
const clusterServicesStack = new pulumi.StackReference('ameier38/cluster-services/prod')

export const smtpUserAccessKeyId = identityStack.getOutput('smtpUserAccessKeyId')
export const smtpUserSmtpPassword = identityStack.getOutput('smtpUserSmtpPassword')
export const monitoringNamespace = clusterServicesStack.requireOutput('monitoringNamespace')
export const prometheusUrl = clusterServicesStack.requireOutput('prometheusUrl')
export const lokiUrl = clusterServicesStack.requireOutput('lokiUrl')
export const grafanaHost = managedInfrastructureStack.requireOutput('grafanaHost')
export const whoamiHost = managedInfrastructureStack.requireOutput('whoamiHost')
