import * as cloudflare from '@pulumi/cloudflare'
import { cloudflareAccountId } from '../config'

export const githubServiceToken = new cloudflare.AccessServiceToken('github', {
    name: 'GitHub',
    accountId: cloudflareAccountId
})
