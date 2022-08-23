import * as cloudflare from '@pulumi/cloudflare'
import * as pulumi from '@pulumi/pulumi'
import * as random from '@pulumi/random'

const k8sTunnelSecret = new random.RandomPassword('k8s-tunnel-secret', {
    length: 32
})

export const k8sTunnel = new cloudflare.ArgoTunnel('k8s', {
    accountId: cloudflare.config.accountId!,
    name: 'k8s',
    secret: k8sTunnelSecret.result.apply(s => Buffer.from(s).toString('base64'))
})

export const k8sTunnelCredentials = pulumi.all([
    k8sTunnel.accountId,
    k8sTunnel.id,
    k8sTunnel.name,
    k8sTunnel.secret
]).apply(([accountId, tunnelId, tunnelName, tunnelSecret]) => {
    return JSON.stringify({
        AccountTag: accountId,
        TunnelID: tunnelId,
        TunnelName: tunnelName,
        TunnelSecret: tunnelSecret
    })
})