import * as cloudflare from '@pulumi/cloudflare'
import * as pulumi from '@pulumi/pulumi'
import * as random from '@pulumi/random'
import * as config from '../config'

class Tunnel extends pulumi.ComponentResource {
    public readonly id: pulumi.Output<string>
    public readonly cname: pulumi.Output<string>
    public readonly credentials: pulumi.Output<string>

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
        this.credentials = pulumi.all([
            tunnel.accountId,
            tunnel.id,
            tunnel.name,
            tunnel.secret
        ]).apply(([accountId, tunnelId, tunnelName, tunnelSecret]) => {
            return JSON.stringify({
                AccountTag: accountId,
                TunnelID: tunnelId,
                TunnelName: tunnelName,
                TunnelSecret: tunnelSecret
            })
        })

        this.registerOutputs({
            id: this.id,
            cname: this.cname,
            credentials: this.credentials
        })
    }
}

export const k8sApiTunnel = new Tunnel('k8s-api')
export const k8sTunnel = new Tunnel('k8s')
