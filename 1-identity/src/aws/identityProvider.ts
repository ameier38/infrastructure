import * as aws from '@pulumi/aws'
import * as config from './config'

// Manually added via console
const githubIdentityProvider = config.accountId.apply(accountId => {
    return aws.iam.OpenIdConnectProvider.get(
        'github',
        `arn:aws:iam::${accountId}:oidc-provider/token.actions.githubusercontent.com`
    )
})

export const githubIdentityProviderArn = githubIdentityProvider.arn
