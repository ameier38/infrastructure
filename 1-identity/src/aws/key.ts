import * as aws from '@pulumi/aws'

const pulumiKey = new aws.kms.Key('pulumi')

export const pulumiKeyAlias = new aws.kms.Alias('pulumi', {
    name: 'alias/pulumi',
    targetKeyId: pulumiKey.keyId
})
