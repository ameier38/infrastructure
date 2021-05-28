import * as auth0 from '@pulumi/auth0'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { logoUrl } from './logo'
import { rootRecord } from './dns'

// NB: used by gateway to validate the oauth token
// ref: https://auth0.com/docs/applications
const gatewayClient = new auth0.Client('gateway', {
    // NB: name that will show up when logging in
    name: config.zone,
    appType: 'non_interactive',
    tokenEndpointAuthMethod: 'client_secret_post',
    logoUri: logoUrl,
    callbacks: [
        // NB: used for testing
        'http://localhost',
        // ref: https://www.getambassador.io/docs/latest/topics/using/filters/oauth2/
        pulumi.interpolate `https://${rootRecord.hostname}/.ambassador/oauth2/redirection-endpoint`,
    ],
    grantTypes: ['authorization_code']
}, { provider: config.auth0Provider })

const defaultConnection = new auth0.Connection('default', {
    // NB: use the Auth0 database
    strategy: 'auth0',
    // NB: you must include the pulumi client id in order to create users
    enabledClients: [config.auth0Config.clientId, gatewayClient.clientId]
}, { provider: config.auth0Provider })

const addEmailToAccessTokenRuleScript = `
function (user, context, callback) {
    context.accessToken['${config.emailClaim}'] = user.email;
    return callback(null, user, context);
}`

new auth0.Rule('add-email-to-access-token', {
    name: 'Add Email to Access Token',
    enabled: true,
    script: addEmailToAccessTokenRuleScript,
    // NB: order starts at 1
    order: 1
}, { provider: config.auth0Provider })

new auth0.User('admin', {
    name: 'admin',
    email: config.auth0Config.adminEmail,
    emailVerified: true,
    connectionName: defaultConnection.name,
    password: config.auth0Config.adminPassword,
}, { provider: config.auth0Provider })

// NB: use the Auth0 management API as the audience to return an access token
// ref: https://auth0.com/docs/tokens/access-tokens/get-access-tokens#control-access-token-audience
const gatewayClientGrant = new auth0.ClientGrant('gateway', {
    clientId: gatewayClient.id,
    audience: pulumi.interpolate `${config.auth0Config.authUrl}/api/v2/`,
    scopes: ['openid'],
}, { provider: config.auth0Provider })

export const gatewayClientId = gatewayClient.clientId
export const gatewayClientSecret = gatewayClient.clientSecret
export const gatewayClientAudience = gatewayClientGrant.audience
