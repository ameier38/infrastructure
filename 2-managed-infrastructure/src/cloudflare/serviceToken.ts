import * as cloudflare from '@pulumi/cloudflare'

const githubServiceToken = new cloudflare.AccessServiceToken('github', {
    name: 'GitHub',
    accountId: cloudflare.config.accountId!
})

export const githubServiceTokenId = githubServiceToken.id
export const githubServiceTokenClientId = githubServiceToken.clientId
export const githubServiceTokenClientSecret = githubServiceToken.clientSecret
