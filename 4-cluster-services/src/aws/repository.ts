import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'
import * as config from '../config'

const repoLifeCyclePolicyArgs : awsx.ecr.LifecyclePolicyArgs = {
    rules: [
        {
            selection: 'any',
            maximumNumberOfImages: 1
        }
    ]
}

const cloudflared = new awsx.ecr.Repository('cloudflared', {
    lifeCyclePolicyArgs: repoLifeCyclePolicyArgs,
})

const cloudflaredCredentials = aws.ecr.getCredentialsOutput({ registryId: cloudflared.repository.registryId })

export const cloudflaredDockerconfigjson =
    pulumi
        .all([cloudflaredCredentials, cloudflared.repository.repositoryUrl])
        .apply(([creds, repoUrl]) => {
            return JSON.stringify({
                auths: {
                    [repoUrl]: {
                        auth: creds.authorizationToken
                    }
                }
            })
        })

export const cloudflaredImageName = cloudflared.buildAndPushImage({ 
    context: path.join(config.srcDir, 'docker'),
    dockerfile: path.join(config.srcDir, 'docker', 'cloudflared-arm64.Dockerfile'),
    extraOptions: ['--quiet']
})
