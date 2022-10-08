import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import * as zone from '../cloudflare/zone'

class DomainVerification extends pulumi.ComponentResource {
    public readonly domain: pulumi.Output<string>
    public readonly identityId: pulumi.Output<string>
    public readonly verificationToken: pulumi.Output<string>
    public readonly dkimTokens: pulumi.Output<string[]>
    constructor(name:string, domain:pulumi.Input<string>, opts?:pulumi.ComponentResourceOptions) {
        super('managed-infrastructure:DomainVerification', name, {}, opts)
        const domainIdentity = new aws.ses.DomainIdentity(name, {
            domain: domain
        }, { parent: this })

        this.domain = domainIdentity.domain
        this.identityId = domainIdentity.id
        this.verificationToken = domainIdentity.verificationToken

        new aws.ses.DomainIdentityVerification(name, {
            domain: domainIdentity.domain
        }, { parent: this })

        const domainDkim = new aws.ses.DomainDkim(name, {
            domain: domainIdentity.domain
        }, { parent: this })

        this.dkimTokens = domainDkim.dkimTokens

        this.registerOutputs({
            identityId: this.identityId,
            verificationToken: this.verificationToken,
            dkimTokens: this.dkimTokens
        })
    }
}

export const andrewmeierDotDevDomainVerification = new DomainVerification('andrewmeier.dev',
    zone.andrewmeierDotDevDomain)

export const sesDotAndrewmeierDotDevMailFrom = new aws.ses.MailFrom('andrewmeier.dev', {
    domain: andrewmeierDotDevDomainVerification.domain,
    mailFromDomain: pulumi.interpolate `ses.${andrewmeierDotDevDomainVerification.domain}`
})
