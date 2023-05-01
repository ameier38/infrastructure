import * as pulumi from '@pulumi/pulumi'
import * as cloudflare from '@pulumi/cloudflare'
import * as path from 'path'

export const rootDir = path.dirname(__dirname)

export const domain = 'andrewmeier.dev'

const rawConfig = new pulumi.Config()
export const email = rawConfig.requireSecret('email')

const rawCloudflareConfig = new pulumi.Config('cloudflare')
export const cloudflareAccountId = rawConfig.requireSecret('cloudflareAccountId')

const rawGithubConfig = new pulumi.Config('github')
export const githubConfig = {
    clientId: rawGithubConfig.requireSecret('clientId'),
    clientSecret: rawGithubConfig.requireSecret('clientSecret')
}
