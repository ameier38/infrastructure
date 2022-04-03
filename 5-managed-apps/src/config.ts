import * as pulumi from '@pulumi/pulumi'

const managedInfrastructureStack = new pulumi.StackReference('ameier38/managed-infrastructure/prod')
const clusterServicesStack = new pulumi.StackReference('ameier38/cluster-services/prod')

export const monitoringNamespace = clusterServicesStack.requireOutput('monitoringNamespace')
export const prometheusUrl = clusterServicesStack.requireOutput('prometheusUrl')
export const lokiUrl = clusterServicesStack.requireOutput('lokiUrl')
export const grafanaHost = managedInfrastructureStack.requireOutput('grafanaHost')
export const whoamiHost = managedInfrastructureStack.requireOutput('whoamiHost')

const rawSmtpConfig = new pulumi.Config('smtp')
export const smtpConfig = {
    user: rawSmtpConfig.require('user'),
    password: rawSmtpConfig.requireSecret('password'),
    host: rawSmtpConfig.require('host'),
    port: rawSmtpConfig.require('port')
}
