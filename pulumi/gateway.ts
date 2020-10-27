import * as auth0 from '@pulumi/auth0'
import * as cloudflare from '@pulumi/cloudflare'
import * as pulumi from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import * as config from './config'
import { k8sProvider, infrastructureNamespace } from './k8s'
import { tldZone } from './zone'

type GatewayArgs = {
    chartVersion: pulumi.Input<string>
    namespace: pulumi.Input<string>
    tldZoneId: pulumi.Input<string>
    authUrl: pulumi.Input<string>
    acmeEmail: pulumi.Input<string>
}

export class Gateway extends pulumi.ComponentResource {
    loadBalancerAddress: pulumi.Output<string>
    clientId: pulumi.Output<string>

    constructor(name:string, args:GatewayArgs, opts:pulumi.ComponentResourceOptions) {
        super('infrastructure:Gateway', name, {}, opts)

        const chart = new k8s.helm.v3.Chart(name, {
            chart: 'ambassador',
            fetchOpts: {
                repo: 'https://getambassador.io'
            },
            version: args.chartVersion,
            namespace: args.namespace,
            values: {
                test: {
                    enabled: false
                },
                crds: {
                    enabled: true,
                    create: true,
                    keep: false
                },
                replicaCount: 1,
                adminService: {
                    create: false
                },
                createDevPortalMappings: false,
                env: {
                    // NB: disables openapi calls for developer docs
                    POLL_EVERY_SECS: 0
                }
            }
        }, { parent: this })

        this.loadBalancerAddress =
            pulumi.all([chart, args.namespace])
            .apply(([chart, namespace]) =>
                chart.getResourceProperty('v1/Service', namespace, `${name}-ambassador`, 'status')
                .apply(status => status.loadBalancer.ingress[0].ip))

        const tldRecord = new cloudflare.Record(`${name}-gateway`, {
            zoneId: args.tldZoneId,
            name: '@',
            type: 'A',
            value: this.loadBalancerAddress
        }, { parent: this })

        // NB: generates certificate
        new k8s.apiextensions.CustomResource(`${name}-gateway`, {
            apiVersion: 'getambassador.io/v2',
            kind: 'Host',
            metadata: { namespace: args.namespace },
            spec: {
                hostname: tldRecord.hostname,
                acmeProvider: {
                    email: args.acmeEmail
                }
            }
        }, { parent: this })

        // NB: used by ambassador to validate the token
        // ref: https://auth0.com/docs/applications
        const client = new auth0.Client(`${name}-gateway`, {
            name: tldRecord.hostname,
            appType: 'non_interactive',
            tokenEndpointAuthMethod: 'client_secret_post',
            callbacks: [
                // NB: used for testing
                'http://localhost',
                // ref: https://www.getambassador.io/docs/latest/topics/using/filters/oauth2/
                pulumi.interpolate `https://${tldRecord.hostname}/.ambassador/oauth2/redirection-endpoint`,
            ],
            grantTypes: ['authorization_code']
        }, { parent: this })

        this.clientId = client.clientId

        // NB: use the Auth0 management API as the audience to return an access token
        // ref: https://auth0.com/docs/tokens/access-tokens/get-access-tokens#control-access-token-audience
        const clientGrant = new auth0.ClientGrant(`${name}-gateway`, {
            clientId: client.clientId,
            audience: pulumi.interpolate `${args.authUrl}/api/v2/`,
            scopes: ['openid'],
        }, { parent: this })

        // NB: specifies oauth client to use for incoming requests
        // ref: https://www.getambassador.io/docs/latest/topics/using/filters/oauth2/
        const oauthFilter = new k8s.apiextensions.CustomResource(`${name}-gateway-oauth`, {
            apiVersion: 'getambassador.io/v2',
            kind: 'Filter',
            metadata: { namespace: args.namespace },
            spec: {
                OAuth2: {
                    // NB: url which serves /.well-known/jwks.json
                    authorizationURL: args.authUrl,
                    extraAuthorizationParameters: {
                        // NB: specifying and audience will tell Auth0 to return an access token instead of opaque token
                        // ref: https://auth0.com/docs/tokens/access-tokens/get-access-tokens
                        audience: clientGrant.audience
                    },
                    clientID: client.clientId,
                    secret: client.clientSecret,
                    protectedOrigins: [{
                        origin: pulumi.interpolate `https://${tldRecord.hostname}`,
                        includeSubdomains: true
                    }]
                }
            }
        }, { parent: this })
        
        // NB: inject user header from email claim
        const jwtFilter = new k8s.apiextensions.CustomResource(`${name}-gateway-jwt`, {
            apiVersion: 'getambassador.io/v2',
            kind: 'Filter',
            metadata: { namespace: args.namespace },
            spec: {
                JWT: {
                    jwksURI: pulumi.interpolate `${args.authUrl}/.well-known/jwks.json`,
                    requireAudience: false,
                    injectRequestHeaders: [{
                        name: 'X-WEBAUTH-USER',
                        // NB: claim is added from auth0 custom rule
                        // NB: must use double quotes in go template
                        value: pulumi.interpolate `{{ index .token.Claims "https://${tldRecord.hostname}/email" }}`
                    }]
                }
            }
        }, { parent: this })

        // NB: add authentication to all subdomains
        new k8s.apiextensions.CustomResource(`${name}-gateway`, {
            apiVersion: 'getambassador.io/v2',
            kind: 'FilterPolicy',
            metadata: { namespace: args.namespace },
            spec: {
                rules: [{
                    host: pulumi.interpolate `*.${tldRecord.hostname}`,
                    path: '*',
                    filters: [
                        { name: oauthFilter.metadata.name, arguments: { scopes: ['openid'] } },
                        { name: jwtFilter.metadata.name }
                    ]
                }]
            }
        }, { parent: this })
    }
}

export const gateway = new Gateway(config.env, {
    chartVersion: '6.5.10',
    namespace: infrastructureNamespace.metadata.name,
    tldZoneId: tldZone.id,
    authUrl: config.auth0Config.authUrl,
    acmeEmail: config.acmeEmail
}, { provider: k8sProvider })
