import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'

const secret = new k8s.core.v1.Secret('grafana', {
    metadata: { namespace: config.monitoringNamespace },
    stringData: {
        user: config.grafanaConfig.user,
        password: config.grafanaConfig.password
    }
})

const chart = new k8s.helm.v3.Chart('grafana', {
    chart: 'grafana',
    version: '6.23.2',
    fetchOpts: { repo: 'https://grafana.github.io/helm-charts' },
    namespace: config.monitoringNamespace,
    values: {
        testFramework: { enabled: false },
        persistence: {
            inMemory: { enabled: true }
        },
        admin: {
            existingSecret: secret.metadata.name,
            userKey: 'user',
            passwordKey: 'password'
        },
        'grafana.ini': {
            server: {
                root_url: 'https://grafana.andrewmeier.dev'
            },
            smtp: {
                enabled: true,
                host: pulumi.interpolate `${config.grafanaConfig.smtpHost}:${config.grafanaConfig.smtpPort}`,
                user: config.grafanaConfig.smtpUser,
                password: config.grafanaConfig.smtpPassword,
                from_address: 'grafana@andrewmeier.dev'
            }
        },
        datasources: {
            'datasources.yaml': {
                apiVersion: 1,
                datasources: [
                    {
                        name: 'Prometheus',
                        type: 'prometheus',
                        url: config.prometheusUrl,
                        access: 'proxy',
                        isDefault: true
                    },
                    {
                        name: 'Loki',
                        type: 'loki',
                        url: config.lokiUrl,
                        access: 'proxy',
                        jsonData: { maxLines: 1000 }
                    }
                ]
            }
        },
        notifiers: {
            'notifiers.yaml': {
                notifiers: [
                    {
                        name: 'email-notifier',
                        type: 'email',
                        uid: 'email1',
                        org_id: 1,
                        is_default: true,
                        settings: { addresses: 'ameier38@gmail.com' }
                    }
                ]
            }
        }
    }
})

const internalHost =
    pulumi.all([chart, config.monitoringNamespace]).apply(([chart, namespace]) => {
        const meta = chart.getResourceProperty('v1/Service', namespace, 'grafana', 'metadata')
        return pulumi.interpolate `${meta.name}.${meta.namespace}.svc.cluster.local`
    })

const internalPort =
    pulumi.all([chart, config.monitoringNamespace]).apply(([chart, namespace]) => {
        const spec = chart.getResourceProperty('v1/Service', namespace, 'grafana', 'spec')
        return spec.ports[0].port
    })

export const internalUrl = pulumi.interpolate `http://${internalHost}:${internalPort}`
