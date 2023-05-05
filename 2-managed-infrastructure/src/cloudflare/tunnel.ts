import * as cloudflare from '@pulumi/cloudflare'
import * as pulumi from '@pulumi/pulumi'
import * as random from '@pulumi/random'
import * as config from '../config'

class Tunnel extends pulumi.ComponentResource {
    public readonly id: pulumi.Output<string>
    public readonly cname: pulumi.Output<string>
    public readonly token: pulumi.Output<string>

    constructor(name: string, opts?: pulumi.ComponentResourceOptions) {
        super('managed-infrastructure:Tunnel', name, {}, opts)
        const tunnelSecret = new random.RandomPassword(`${name}-tunnel`, {
            length: 32
        }, { parent: this })

        const tunnel = new cloudflare.Tunnel(name, {
            accountId: config.cloudflareAccountId,
            name: name,
            secret: tunnelSecret.result.apply(s => Buffer.from(s).toString('base64'))
        }, { parent: this})

        this.id = tunnel.id
        this.cname = tunnel.cname
        this.token = tunnel.tunnelToken

        this.registerOutputs({
            id: this.id,
            cname: this.cname,
            token: this.token
        })
    }
}

export const k8sApiTunnel = new Tunnel('k8s-api')
export const k8sTunnel = new Tunnel('k8s')
