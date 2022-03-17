import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import * as record from './record'
import * as dockerImage from './dockerImage'

const identifier = 'cloudflared'

const cloudflaredConfig = pulumi.interpolate `
tunnel: ${config.tunnelId}
credentials-file: /var/secrets/cloudflared/credentials.json
metrics: 0.0.0.0:2000
no-autoupdate: true
ingress:
  - hostname: ${record.andrewmeierDotDevHostname}
    service: http://blog.blog
  - hostname: ${record.grafanaDotAndrewmeierDotDevHostname}
    service: http://grafana.monitoring
  - service: http_status:404
`

const cloudflaredSecret = new k8s.core.v1.Secret(identifier, {
    metadata: { namespace: config.cloudflaredNamespace },
    stringData: {
        'config.yaml': cloudflaredConfig,
        'credentials.json': config.tunnelCredentials
    }
})

const registrySecret = new k8s.core.v1.Secret(`${identifier}-registry`, {
    metadata: { namespace: config.cloudflaredNamespace },
    type: 'kubernetes.io/dockerconfigjson',
    stringData: {
        '.dockerconfigjson': config.dockerCredentials
    }
})

const labels = { 'app.kubernetes.io/name': identifier }

new k8s.apps.v1.Deployment(identifier, {
    metadata: {
        name: identifier,
        namespace: config.cloudflaredNamespace
    },
    spec: {
        replicas: 1,
        selector: { matchLabels: labels },
        template: {
            metadata: {
                labels: labels,
                annotations: {
                    'prometheus.io/scrape': 'true',
                    'prometheus.io/path': '/metrics',
                    'prometheus.io/port': '2000',
                }
            },
            spec: {
                imagePullSecrets: [{
                    name: registrySecret.metadata.name
                }],
                containers: [{
                        name: identifier,
                        image: dockerImage.cloudflaredArm64ImageName,
                        args: [
                            'tunnel',
                            '--config', '/var/secrets/cloudflared/config.yaml',
                            'run'
                        ],
                        livenessProbe: {
                            httpGet: { path: '/ready', port: 2000 },
                            failureThreshold: 1,
                            initialDelaySeconds: 10,
                            periodSeconds: 10
                        },
                        volumeMounts: [{
                            name: 'cloudflared',
                            mountPath: '/var/secrets/cloudflared',
                            readOnly: true
                        }]
                }],
                volumes: [{
                    name: 'cloudflared',
                    secret: { secretName: cloudflaredSecret.metadata.name }
                }],
                nodeSelector: { 'kubernetes.io/arch': 'arm64' }
            }            
        }
    }
})
