import * as aws from '@pulumi/aws'
import * as identityProvider from './identityProvider'
import * as config from '../config'

const infrastructureDeployer = new aws.iam.Role('infrastructure-deployer', {
    name: 'infrastructure-deployer',
    assumeRolePolicy: {
        Version: '2012-10-17',
        Statement: [
            // Trust principals in this account to assume role
            {
                Effect: 'Allow',
                Action: 'sts:AssumeRole',
                Principal: {
                    AWS: config.accountId
                }
            },
            // Allow `infrastructure` repo actions to assume role
            {
                Effect: 'Allow',
                Action: 'sts:AssumeRoleWithWebIdentity',
                Principal: {
                    Federated: identityProvider.githubIdentityProviderArn
                },
                Condition: {
                    StringEquals: {
                        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
                    },
                    StringLike: {
                        'token.actions.githubusercontent.com:sub': 'repo:ameier38/infrastructure:*'
                    }
                }
            }
        ]
    }
})

export const infrastructureDeployerName = infrastructureDeployer.name
export const infrastructureDeployerArn = infrastructureDeployer.arn

const blogDeployer = new aws.iam.Role('blog-deployer', {
    name: 'blog-deployer',
    assumeRolePolicy: {
        Version: '2012-10-17',
        Statement: [
            // Trust principals in this account to assume role
            {
                Effect: 'Allow',
                Action: 'sts:AssumeRole',
                Principal: {
                    AWS: config.accountId
                }
            },
            // Allow `andrewmeier.dev` repo actions to assume role
            {
                Effect: 'Allow',
                Action: 'sts:AssumeRoleWithWebIdentity',
                Principal: {
                    Federated: identityProvider.githubIdentityProviderArn
                },
                Condition: {
                    StringEquals: {
                        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
                    },
                    StringLike: {
                        'token.actions.githubusercontent.com:sub': 'repo:ameier38/andrewmeier.dev:*'
                    }
                }
            }
        ]
    }
})

export const blogDeployerName = blogDeployer.name
export const blogDeployerArn = blogDeployer.arn
