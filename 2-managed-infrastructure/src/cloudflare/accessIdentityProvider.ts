import * as cloudflare from '@pulumi/cloudflare'
import * as config from '../config'

export const githubIdentityProvider = new cloudflare.AccessIdentityProvider('github', {
    name: 'github',
    type: 'github',
    accountId: cloudflare.config.accountId!,
    configs: [{
        clientId: config.githubConfig.clientId,
        clientSecret: config.githubConfig.clientSecret
    }]
})
