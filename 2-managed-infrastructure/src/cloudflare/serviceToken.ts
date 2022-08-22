import * as cloudflare from '@pulumi/cloudflare'

export const githubServiceToken = new cloudflare.AccessServiceToken('github', {
    name: 'GitHub',
    accountId: cloudflare.config.accountId!
})
