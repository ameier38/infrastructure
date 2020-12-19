import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { rootRecord } from './dns'
import { ambassadorClient, ambassadorClientGrant } from './identity'
import { infrastructureNamespace } from './namespace'

// NB: specifies oauth client to use for incoming requests
// ref: https://www.getambassador.io/docs/latest/topics/using/filters/oauth2/
export const oauthFilter = new k8s.apiextensions.CustomResource(`${config.env}-oauth-filter`, {
    apiVersion: 'getambassador.io/v2',
    kind: 'Filter',
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        OAuth2: {
            // NB: url which serves /.well-known/jwks.json
            authorizationURL: config.auth0Config.authUrl,
            extraAuthorizationParameters: {
                // NB: specifying an audience will tell Auth0 to return an access token instead of opaque token
                // ref: https://auth0.com/docs/tokens/access-tokens/get-access-tokens
                audience: ambassadorClientGrant.audience
            },
            clientID: ambassadorClient.clientId,
            secret: ambassadorClient.clientSecret,
            protectedOrigins: [{
                // NB: used as callback
                origin: pulumi.interpolate `https://${rootRecord.hostname}`,
                includeSubdomains: true
            }]
        }
    }
}, { provider: config.k8sProvider })

// NB: inject user header from email claim
export const jwtFilter = new k8s.apiextensions.CustomResource(`${config.env}-jwt-filter`, {
    apiVersion: 'getambassador.io/v2',
    kind: 'Filter',
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        JWT: {
            jwksURI: pulumi.interpolate `${config.auth0Config.authUrl}/.well-known/jwks.json`,
            requireAudience: false,
            injectRequestHeaders: [{
                name: 'X-WEBAUTH-USER',
                // NB: claim is added from auth0 custom rule
                // NB: must use double quotes in go template
                value: pulumi.interpolate `{{ index .token.Claims "${config.emailClaim}" }}`
            }]
        }
    }
}, { provider: config.k8sProvider })
