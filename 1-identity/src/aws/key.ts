import * as aws from '@pulumi/aws'

const pulumiKey = new aws.kms.Key('pulumi', {
    description: 'Key for encrypting Pulumi secrets'
})

export const pulumiKeyArn = pulumiKey.arn

new aws.kms.Alias('pulumi', {
    name: 'alias/pulumi',
    targetKeyId: pulumiKey.keyId
})
