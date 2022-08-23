import * as aws from '@pulumi/aws'

export const pulumiKey = new aws.kms.Key('pulumi')
