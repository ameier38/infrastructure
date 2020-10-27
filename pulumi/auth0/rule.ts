import * as auth0 from '@pulumi/auth0'
import * as config from '../config'

const addEmailToAccessTokenRuleScript = `
function (user, context, callback) {
    context.accessToken['https://${config.tld}/email'] = user.email;
    return callback(null, user, context);
}`

export const addEmailToAccessTokenRule = new auth0.Rule('add-email-to-access-token', {
    name: 'Add Email to Access Token',
    enabled: true,
    script: addEmailToAccessTokenRuleScript,
    // NB: order starts at 1
    order: 1
}, { provider: config.auth0Provider })
