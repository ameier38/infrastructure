import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'

export const rootDir = path.dirname(__dirname)

export const domain = 'andrewmeier.dev'

const rawConfig = new pulumi.Config()
export const email = rawConfig.requireSecret('email')

const rawGithubConfig = new pulumi.Config('github')
export const githubConfig = {
    clientId: rawGithubConfig.requireSecret('clientId'),
    clientSecret: rawGithubConfig.requireSecret('clientSecret')
}
