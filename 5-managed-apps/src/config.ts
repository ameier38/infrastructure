import * as pulumi from '@pulumi/pulumi'

const clusterServicesStack = new pulumi.StackReference('ameier38/cluster-services/prod')

export const monitoringNamespace = clusterServicesStack.requireOutput('monitoringNamespace')
export const prometheusUrl = clusterServicesStack.requireOutput('prometheusUrl')
export const lokiUrl = clusterServicesStack.requireOutput('lokiUrl')

const rawGrafanaConfig = new pulumi.Config('grafana')
export const grafanaConfig = {
    user: rawGrafanaConfig.require('user'),
    password: rawGrafanaConfig.requireSecret('password'),
    smtpUser: rawGrafanaConfig.require('smtpUser'),
    smtpPassword: rawGrafanaConfig.requireSecret('smtpPassword'),
    smtpHost: rawGrafanaConfig.require('smtpHost'),
    smtpPort: rawGrafanaConfig.require('smtpPort')
}
