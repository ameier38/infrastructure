import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'

export const accountId = pulumi.output(aws.getCallerIdentity().then(id => id.accountId))
export const region = aws.config.region
