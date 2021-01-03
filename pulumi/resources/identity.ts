import * as auth0 from '@pulumi/auth0'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'
import { rootRecord } from './dns'
import { amIconUrl } from './bucket'

// NB: used by ambassador to validate the token
// ref: https://auth0.com/docs/applications
export const ambassadorClient = new auth0.Client('ambassador', {
    // NB: name that will show up when logging in
    name: 'andrewmeier.dev',
    appType: 'non_interactive',
    tokenEndpointAuthMethod: 'client_secret_post',
    logoUri: amIconUrl,
    callbacks: [
        // NB: used for testing
        'http://localhost',
        // ref: https://www.getambassador.io/docs/latest/topics/using/filters/oauth2/
        pulumi.interpolate `https://${rootRecord.hostname}/.ambassador/oauth2/redirection-endpoint`,
    ],
    grantTypes: ['authorization_code']
}, { provider: config.auth0Provider })

// NB: use the Auth0 management API as the audience to return an access token
// ref: https://auth0.com/docs/tokens/access-tokens/get-access-tokens#control-access-token-audience
export const ambassadorClientGrant = new auth0.ClientGrant('ambassador', {
    clientId: ambassadorClient.id,
    audience: pulumi.interpolate `${config.auth0Config.authUrl}/api/v2/`,
    scopes: ['openid'],
}, { provider: config.auth0Provider })

const defaultConnection = new auth0.Connection('default', {
    strategy: 'auth0',
    // NB: you must include the pulumi client id in order to create users
    enabledClients: [config.auth0Config.clientId, ambassadorClient.clientId]
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

export const adminUser = new auth0.User('admin', {
    name: 'admin',
    email: config.auth0Config.adminEmail,
    emailVerified: true,
    connectionName: defaultConnection.name,
    password: config.auth0Config.adminPassword,
}, { provider: config.auth0Provider })
