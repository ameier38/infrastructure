import * as docker from '@pulumi/docker'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'
import * as config from '../config'

const identifier = 'cloudflared'

const cloudflaredArm64 = new docker.Image('cloudflared-arm64', {
    imageName: pulumi.interpolate `${config.registryServer}/${config.registryName}/cloudflared-arm64`,
    build: {
        context: path.join(config.srcDir, 'docker'),
        dockerfile: path.join(config.srcDir, 'docker', 'cloudflared-arm64.Dockerfile'),
        extraOptions: ['--quiet']
    },
    registry: {
        server: config.registryServer,
        username: config.registryUser,
        password: config.registryPassword
    }
})

const cloudflaredConfig = pulumi.interpolate `
tunnel: ${config.k8sTunnelId}
credentials-file: /var/secrets/cloudflared/credentials.json
metrics: 0.0.0.0:2000
no-autoupdate: true
ingress:
  - hostname: ${config.andrewmeierDotDevDomain}
    service: http://traefik.kube-system
  - hostname: '*.${config.andrewmeierDotDevDomain}'
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

const registrySecret = new k8s.core.v1.Secret(`${identifier}-registry`, {
    metadata: { namespace: 'kube-system' },
    type: 'kubernetes.io/dockerconfigjson',
    stringData: {
        '.dockerconfigjson': config.dockerconfigjson
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
                imagePullSecrets: [{
                    name: registrySecret.metadata.name
                }],
                containers: [{
                        name: identifier,
                        image: cloudflaredArm64.imageName,
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
