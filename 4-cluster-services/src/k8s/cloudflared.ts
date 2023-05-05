import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from '../config'

const identifier = 'cloudflared'

const cloudflaredConfig = pulumi.interpolate `
tunnel: ${config.k8sTunnelId}
metrics: 0.0.0.0:2000
no-autoupdate: true
ingress:
  - hostname: ${config.andrewmeierDotDevDomain}
    service: http://traefik.kube-system
  - hostname: '*.${config.andrewmeierDotDevDomain}'
    service: http://traefik.kube-system
  - hostname: ${config.meiermadeDotComDomain}
    service: http://traefik.kube-system
  - hostname: '*.${config.meiermadeDotComDomain}'
    service: http://traefik.kube-system
  - service: http_status:404
`

const cloudflaredSecret = new k8s.core.v1.Secret(identifier, {
    metadata: { namespace: 'kube-system' },
    stringData: {
        'config.yaml': cloudflaredConfig,
        'credentials.json': config.k8sTunnelCredentials
    }
})

const labels = { 'app.kubernetes.io/name': identifier }

new k8s.apps.v1.Deployment(identifier, {
    metadata: {
        name: identifier,
        namespace: 'kube-system'
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
                containers: [{
                        name: identifier,
                        image: 'cloudflare/cloudflared:2023.5.0-arm64',
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
