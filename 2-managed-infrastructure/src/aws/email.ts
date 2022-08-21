import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import * as zone from '../cloudflare/zone'

const domainIdentity = new aws.ses.DomainIdentity('andrewmeier.dev', {
    domain: zone.andrewmeierDotDevDomain
})

export const identityId = domainIdentity.id
export const verificationToken = domainIdentity.verificationToken

new aws.ses.DomainIdentityVerification('andrewmeier.dev', {
    domain: domainIdentity.domain
})

const domainDkim = new aws.ses.DomainDkim('andrewmeier.dev', {
    domain: domainIdentity.domain
})

export const dkimTokens = domainDkim.dkimTokens

const mailFrom = new aws.ses.MailFrom('andrewmeier.dev', {
    domain: domainIdentity.domain,
    mailFromDomain: pulumi.interpolate `ses.${domainIdentity.domain}`
})

export const mailFromDomain = mailFrom.mailFromDomain
