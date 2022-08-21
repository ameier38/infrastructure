import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'

const identifier = 'whoami'

const labels = { 'app.kubernetes.io/name': identifier }

const deployment = new k8s.apps.v1.Deployment(identifier, {
    metadata: { namespace: 'kube-system' },
    spec: {
        selector: { matchLabels: labels },
        replicas: 1,
        template: {
            metadata: { labels },
            spec: {
                containers: [{
                    name: identifier,
                    image: 'traefik/whoami',
                    imagePullPolicy: 'IfNotPresent',
                    livenessProbe: { httpGet: { path: '/health', port: 80 } },
                    readinessProbe: { httpGet: { path: '/health', port: 80 } }
                }]
            }
        }
    }
})

const service = new k8s.core.v1.Service(identifier, {
    metadata: { name: identifier, namespace: 'kube-system' },
    spec: {
        type: 'ClusterIP',
        selector: labels,
        ports: [{ port: 80, targetPort: 80 }]
    }
}, { dependsOn: deployment })

new k8s.apiextensions.CustomResource('whoami-route', {
    apiVersion: 'traefik.containo.us/v1alpha1',
    kind: 'IngressRoute',
    metadata: { namespace: 'kube-system' },
    spec: {
        entryPoints: ['web'],
        routes: [{
            kind: 'Rule',
            match: pulumi.interpolate `Host(\`${config.whoamiHost}\`)`,
            services: [{
                kind: 'Service',
                name: service.metadata.name,
                namespace: service.metadata.namespace,
                port: service.spec.ports[0].port
            }]
        }]
    }
})
