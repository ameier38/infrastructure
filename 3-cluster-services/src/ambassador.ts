import * as cloudflare from '@pulumi/cloudflare'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { infrastructureNamespace } from './namespace'

const identifier = 'ambassador'

export const ambassadorChart = new k8s.helm.v3.Chart(identifier, {
    chart: 'ambassador',
    fetchOpts: {
        repo: 'https://getambassador.io'
    },
    version: '6.9.1',
    namespace: infrastructureNamespace.metadata.name,
    transformations: [(obj:any) => {
        if (obj.metadata !== undefined) {
            if (obj.metadata.name && obj.metadata.name.includes('crd-cleanup')) {
                obj.apiVersion = 'v1'
                obj.kind = 'List'
                obj.items = []
            }
        }
    }],
    values: {
        replicaCount: 1,
        test: {
            enabled: false
        },
        crds: {
            enabled: true,
            create: true,
            keep: false
        },
        adminService: {
            create: false
        },
        agent: {
            enabled: false
        },
        createDevPortalMappings: false,
        service: { 
            type: 'LoadBalancer',
            ports: [
                { name: 'http', port: 80, targetPort: 8080 },
                { name: 'https', port: 443, targetPort: 8443 }
            ]
        },
        env: {
            // NB: disables openapi calls for developer docs
            POLL_EVERY_SECS: 0
        },
        // NB: make sure it runs on Ubuntu nodes (cannot run on ARM)
        nodeSelector: { 'kubernetes.io/arch': 'amd64' }
    }
}, { provider: config.k8sProvider })


export const internalHost =
    pulumi.all([ambassadorChart, infrastructureNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, identifier, 'metadata'))
    .apply(meta => `${meta.name}.${meta.namespace}.svc.cluster.local`)

export const internalPort =
    pulumi.all([ambassadorChart, infrastructureNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, identifier, 'spec'))
    .apply(spec => spec.ports.find(port => port.name === 'http')!.port)

export const loadBalancerIpAddress =
    pulumi.all([ambassadorChart, infrastructureNamespace.metadata.name])
    .apply(([chart, namespace]) => chart.getResourceProperty('v1/Service', namespace, identifier, 'status'))
    .apply(status => status.loadBalancer.ingress[0].ip)

const record = new cloudflare.Record(identifier, {
    zoneId: config.zoneId,
    name: '@',
    type: 'A',
    value: loadBalancerIpAddress
}, { provider: config.cloudflareProvider })

// NB: generates certificate
new k8s.apiextensions.CustomResource(`${identifier}-host`, {
    apiVersion: 'getambassador.io/v2',
    kind: 'Host',
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        hostname: record.hostname,
        acmeProvider: {
            email: config.acmeEmail
        }
    }
}, { provider: config.k8sProvider, dependsOn: ambassadorChart })

// NB: specifies oauth client to use for incoming requests
// ref: https://www.getambassador.io/docs/latest/topics/using/filters/oauth2/
export const oauthFilter = new k8s.apiextensions.CustomResource('oauth-filter', {
    apiVersion: 'getambassador.io/v2',
    kind: 'Filter',
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        OAuth2: {
            // NB: url which serves /.well-known/jwks.json
            authorizationURL: config.authUrl,
            extraAuthorizationParameters: {
                // NB: specifying an audience will tell Auth0 to return an access token instead of opaque token
                // ref: https://auth0.com/docs/tokens/access-tokens/get-access-tokens
                audience: config.gatewayConfig.clientAudience
            },
            clientID: config.gatewayConfig.clientId,
            secret: config.gatewayConfig.clientSecret,
            protectedOrigins: [{
                // NB: used as callback
                origin: pulumi.interpolate `https://${config.zone}`,
                includeSubdomains: true
            }]
        }
    }
}, { provider: config.k8sProvider, dependsOn: ambassadorChart })

// NB: inject user header from email claim
export const jwtFilter = new k8s.apiextensions.CustomResource('jwt-filter', {
    apiVersion: 'getambassador.io/v2',
    kind: 'Filter',
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        JWT: {
            jwksURI: pulumi.interpolate `${config.authUrl}/.well-known/jwks.json`,
            requireAudience: false,
            injectRequestHeaders: [{
                name: 'X-WEBAUTH-USER',
                // NB: claim is added from auth0 custom rule
                // NB: must use double quotes in go template
                value: pulumi.interpolate `{{ index .token.Claims "${config.emailClaim}" }}`
            }]
        }
    }
}, { provider: config.k8sProvider, dependsOn: ambassadorChart })
