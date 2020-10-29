import * as auth0 from '@pulumi/auth0'
import * as cloudflare from '@pulumi/cloudflare'
import * as pulumi from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import * as config from './config'
import { k8sProvider } from './cluster'
import { infrastructureNamespace } from './namespace'
import { zone } from './zone'

type GatewayArgs = {
    chartVersion: pulumi.Input<string>
    namespace: pulumi.Input<string>
    zoneId: pulumi.Input<string>
    authUrl: pulumi.Input<string>
    acmeEmail: pulumi.Input<string>
}

export class Gateway extends pulumi.ComponentResource {
    host: pulumi.Output<string>
    loadBalancerAddress: pulumi.Output<string>
    clientId: pulumi.Output<string>
    clientSecret: pulumi.Output<string>
    clientAudience: pulumi.Output<string>

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

        const record = new cloudflare.Record(`${name}-gateway`, {
            zoneId: args.zoneId,
            name: '@',
            type: 'A',
            value: this.loadBalancerAddress
        }, { parent: this })

        this.host = record.hostname

        // NB: generates certificate
        new k8s.apiextensions.CustomResource(`${name}-gateway`, {
            apiVersion: 'getambassador.io/v2',
            kind: 'Host',
            metadata: { namespace: args.namespace },
            spec: {
                hostname: record.hostname,
                acmeProvider: {
                    email: args.acmeEmail
                }
            }
        }, { parent: this })

        // NB: used by ambassador to validate the token
        // ref: https://auth0.com/docs/applications
        const client = new auth0.Client(`${name}-gateway`, {
            name: record.hostname,
            appType: 'non_interactive',
            tokenEndpointAuthMethod: 'client_secret_post',
            callbacks: [
                // NB: used for testing
                'http://localhost',
                // ref: https://www.getambassador.io/docs/latest/topics/using/filters/oauth2/
                pulumi.interpolate `https://${record.hostname}/.ambassador/oauth2/redirection-endpoint`,
            ],
            grantTypes: ['authorization_code']
        }, { parent: this })

        this.clientId = client.clientId
        this.clientSecret = client.clientSecret

        // NB: use the Auth0 management API as the audience to return an access token
        // ref: https://auth0.com/docs/tokens/access-tokens/get-access-tokens#control-access-token-audience
        const clientGrant = new auth0.ClientGrant(`${name}-gateway`, {
            clientId: client.clientId,
            audience: pulumi.interpolate `${args.authUrl}/api/v2/`,
            scopes: ['openid'],
        }, { parent: this })

        this.clientAudience = clientGrant.audience

        this.registerOutputs({
            loadBalancerAddress: this.loadBalancerAddress,
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            clientAudience: this.clientAudience
        })
    }
}

export const gateway = new Gateway(config.env, {
    chartVersion: '6.5.10',
    namespace: infrastructureNamespace.metadata.name,
    zoneId: zone.id,
    authUrl: config.auth0Config.authUrl,
    acmeEmail: config.acmeEmail
}, { provider: k8sProvider })
