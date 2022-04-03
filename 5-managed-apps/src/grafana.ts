import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'

const identifier = 'grafana'

const chart = new k8s.helm.v3.Chart(identifier, {
    chart: 'grafana',
    version: '6.24.1',
    fetchOpts: { repo: 'https://grafana.github.io/helm-charts' },
    namespace: config.monitoringNamespace,
    values: {
        // NB: use old version so that we can provision notifiers
        image: { tag: '8.2.7' },
        testFramework: { enabled: false },
        persistence: {
            inMemory: { enabled: true }
        },
        'grafana.ini': {
            server: {
                root_url: pulumi.interpolate `https://${config.grafanaHost}`,
            },
            smtp: {
                enabled: true,
                host: pulumi.interpolate `${config.smtpConfig.host}:${config.smtpConfig.port}`,
                user: config.smtpConfig.user,
                password: config.smtpConfig.password,
                from_address: 'grafana@andrewmeier.dev'
            },
            users: {
                auto_assign_org_role: 'Admin'
            },
            'auth.proxy': {
                enabled: true,
                header_name: 'Cf-Access-Authenticated-User-Email',
                header_property: 'email'
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

const internalPort =
    pulumi.all([chart, config.monitoringNamespace]).apply(([chart, namespace]) => {
        const spec = chart.getResourceProperty('v1/Service', namespace, identifier, 'spec')
        return spec.ports[0].port
    })

new k8s.apiextensions.CustomResource(`${identifier}-route`, {
    apiVersion: 'traefik.containo.us/v1alpha1',
    kind: 'IngressRoute',
    metadata: { namespace: config.monitoringNamespace },
    spec: {
        entryPoints: ['web'],
        routes: [{
            kind: 'Rule',
            match: pulumi.interpolate `Host(\`${config.grafanaHost}\`)`,
            services: [{
                kind: 'Service',
                name: identifier,
                namespace: config.monitoringNamespace,
                port: internalPort
            }]
        }]
    }
})
