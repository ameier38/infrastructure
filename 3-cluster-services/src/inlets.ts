import * as cloudflare from '@pulumi/cloudflare'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { infrastructureNamespace } from './namespace'
import { ambassadorChart, loadBalancerIpAddress } from './ambassador'

const serverLabels = { 'app.kubernetes.io/name': 'inlets-server' }

const dataPort = 8000
const controlPort = 8123

new k8s.apps.v1.Deployment('inlets-server', {
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        selector: { matchLabels: serverLabels },
        replicas: 1,
        template: {
            metadata: { labels: serverLabels },
            spec: {
                containers: [{
                    name: 'inlets',
                    image: pulumi.interpolate `ghcr.io/inlets/inlets-pro:${config.inletsConfig.version}`,
                    imagePullPolicy: 'IfNotPresent',
                    command: ['inlets-pro'],
                    args: [
                        'http',
                        'server',
                        '--auto-tls=false',
                        `--control-port=${controlPort}`,
                        `--port=${dataPort}`,
                        pulumi.interpolate `--token=${config.inletsConfig.token}`
                    ],
                    resources: {
                        limits: { memory: '128Mi' },
                        requests: { cpu: '25m', memory: '25Mi' }
                    }
                }],
                nodeSelector: { 'kubernetes.io/arch': 'amd64' }
            }
        }
    }
}, { provider: config.k8sProvider })

const service = new k8s.core.v1.Service('inlets-service', {
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        type: 'ClusterIP',
        selector: serverLabels,
        ports: [
            { name: 'data-port', protocol: 'TCP', port: dataPort, targetPort: dataPort },
            { name: 'control-port', protocol: 'TCP', port: controlPort, targetPort: controlPort }
        ]
    }
}, { provider: config.k8sProvider })

const inletsRecord = new cloudflare.Record('inlets', {
    zoneId: config.zoneId,
    name: 'inlets',
    type: 'A',
    value: loadBalancerIpAddress
}, { provider: config.cloudflareProvider })

const demoRecord = new cloudflare.Record('demo', {
    zoneId: config.zoneId,
    name: 'demo',
    type: 'A',
    value: loadBalancerIpAddress
}, { provider: config.cloudflareProvider })

// NB: generates inlets certificate
new k8s.apiextensions.CustomResource('inlets-host', {
    apiVersion: 'getambassador.io/v2',
    kind: 'Host',
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        hostname: inletsRecord.hostname,
        acmeProvider: {
            email: config.acmeEmail
        }
    }
}, { provider: config.k8sProvider, dependsOn: ambassadorChart })

// NB: generates demo certificate
new k8s.apiextensions.CustomResource('demo-host', {
    apiVersion: 'getambassador.io/v2',
    kind: 'Host',
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        hostname: demoRecord.hostname,
        acmeProvider: {
            email: config.acmeEmail
        }
    }
}, { provider: config.k8sProvider, dependsOn: ambassadorChart })

// NB: direct incoming websocket requests to inlets control plane
new k8s.apiextensions.CustomResource('inlets-mapping', {
    apiVersion: 'getambassador.io/v2',
    kind: 'Mapping',
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        prefix: '/',
        host: inletsRecord.hostname,
        service: pulumi.interpolate `${service.metadata.name}.${service.metadata.namespace}.svc.cluster.local:${controlPort}`,
        // ref: https://www.getambassador.io/docs/edge-stack/latest/howtos/websockets/
        allow_upgrade: ['websocket']
    }
}, { provider: config.k8sProvider, dependsOn: ambassadorChart })

// NB: direct incoming requests to data plane
new k8s.apiextensions.CustomResource('demo-mapping', {
    apiVersion: 'getambassador.io/v2',
    kind: 'Mapping',
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        prefix: '/',
        host: demoRecord.hostname,
        service: pulumi.interpolate `${service.metadata.name}.${service.metadata.namespace}.svc.cluster.local:${dataPort}`
    }
}, { provider: config.k8sProvider, dependsOn: ambassadorChart })
