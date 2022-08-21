import * as aws from '@pulumi/aws'

const admin = aws.iam.User.get('admin', 'admin')

export const adminName = admin.name

const smtpUser = new aws.iam.User('smtp-user')

export const smtpUserName = smtpUser.name

const smtpUserAccessKey = new aws.iam.AccessKey('smtp-user-access-key', {
    user: smtpUser.name
})

export const smtpUserAccessKeyId = smtpUserAccessKey.id
export const smtpUserSmtpPassword = smtpUserAccessKey.sesSmtpPasswordV4
