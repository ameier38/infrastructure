import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import * as key from './key'
import * as role from './role'
import * as user from './user'
import * as config from '../config'

new aws.iam.UserPolicy('admin', {
    name: 'admin',
    user: user.adminName,
    policy: {
        Version: '2012-10-17',
        Statement: [
            // Allow `admin` user to assume `managed-infrastructure-deployer` role
            {
                Effect: 'Allow',
                Action: 'sts:AssumeRole',
                Resource: role.infrastructureDeployerArn
            },
            // Allow `admin` user to assume `blog-deployer` role
            {
                Effect: 'Allow',
                Action: 'sts:AssumeRole',
                Resource: role.blogDeployerArn
            }
        ]
    }
})

new aws.iam.UserPolicy('smtp-user-policy', {
    user: user.smtpUserName,
    policy: {
        Version: '2012-10-17',
        Statement: [
            // Allow `smtp-user` to send emails
            {
                Effect: 'Allow',
                Action: 'ses:SendRawEmail',
                Resource: '*'
            }
        ]
    }
})

new aws.iam.RolePolicy('infrastructure-deployer', {
    name: 'infrastructure-deployer',
    role: role.infrastructureDeployerName,
    policy: {
        Version: '2012-10-17',
        Statement: [
            // Allow usage of `pulumi` key
            {
                Effect: 'Allow',
                Action: [
                    'kms:Decrypt',
                    'kms:Encrypt'
                ],
                Resource: key.pulumiKey.arn
            },
            // Allow management of cloudflared ecr repository
            {
                Effect: 'Allow',
                Action: 'ecr:GetAuthorizationToken',
                Resource: '*'
            },
            {
                Effect: 'Allow',
                Action: [
                    'ecr:*'
                ],
                Resource: pulumi.interpolate `arn:aws:ecr:${config.region}:${config.accountId}:repository/cloudflared-*`
            },
            // Allow management of ameier38-public bucket
            {
                Effect: 'Allow',
                Action: [
                    's3:*',
                ],
                Resource: [
                    'arn:aws:s3:::ameier38-public',
                    'arn:aws:s3:::ameier38-public/*'
                ]
            },
            // Allow `infrastructure-deployer` role to manage email service
            {
                Effect: 'Allow',
                Action: [
                    'ses:*',
                ],
                Resource: '*'
            },
        ]
    }
})

new aws.iam.RolePolicy('blog-deployer', {
    name: 'blog-deployer',
    role: role.blogDeployerName,
    policy: {
        Version: '2012-10-17',
        Statement: [
            // Allow usage of `pulumi` key
            {
                Effect: 'Allow',
                Action: [
                    'kms:Decrypt',
                    'kms:Encrypt'
                ],
                Resource: key.pulumiKey.arn
            },
            // Allow management of blog ecr repository
            {
                Effect: 'Allow',
                Action: 'ecr:GetAuthorizationToken',
                Resource: '*'
            },
            {
                Effect: 'Allow',
                Action: [
                    'ecr:*'
                ],
                Resource: pulumi.interpolate `arn:aws:ecr:${config.region}:${config.accountId}:repository/blog-*`
            }
        ]
    }
})

new aws.iam.RolePolicy('meiermade-deployer', {
    name: 'meiermade-deployer',
    role: role.meiermadeDeployerName,
    policy: {
        Version: '2012-10-17',
        Statement: [
            // Allow usage of `pulumi` key
            {
                Effect: 'Allow',
                Action: [
                    'kms:Decrypt',
                    'kms:Encrypt'
                ],
                Resource: key.pulumiKey.arn
            },
            // Allow management of meiermade ecr repository
            {
                Effect: 'Allow',
                Action: 'ecr:GetAuthorizationToken',
                Resource: '*'
            },
            {
                Effect: 'Allow',
                Action: [
                    'ecr:*'
                ],
                Resource: pulumi.interpolate `arn:aws:ecr:${config.region}:${config.accountId}:repository/meiermade-*`
            }
        ]
    }
})
