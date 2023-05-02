import * as pulumi from '@pulumi/pulumi'
import * as cloudflare from '@pulumi/cloudflare'
import * as path from 'path'

export const rootDir = path.dirname(__dirname)

export const domain = 'andrewmeier.dev'

const rawConfig = new pulumi.Config()
export const email = rawConfig.requireSecret('email')

export const cloudflareAccountId = rawConfig.requireSecret('cloudflareAccountId')

const cloudflareOriginCertificateKey = rawConfig.requireSecret('cloudflareOriginCertificateKey')
export const cloudflareOriginCertificateProvider = new cloudflare.Provider('origin-certificate', {
    apiUserServiceKey: cloudflareOriginCertificateKey
})

const rawGithubConfig = new pulumi.Config('github')
export const githubConfig = {
    clientId: rawGithubConfig.requireSecret('clientId'),
    clientSecret: rawGithubConfig.requireSecret('clientSecret')
}
