import * as cloudflare from '@pulumi/cloudflare'
import * as pulumi from '@pulumi/pulumi'
import * as random from '@pulumi/random'

const tunnelSecret = new random.RandomPassword('k8s-api-tunnel', {
    length: 32
})

export const k8sApiTunnel = new cloudflare.ArgoTunnel('k8s-api', {
    accountId: cloudflare.config.accountId!,
    name: 'k8s-api',
    secret: tunnelSecret.result.apply(s => Buffer.from(s).toString('base64'))
})

export const k8sApiTunnelCredentials = pulumi.all([
    k8sApiTunnel.accountId,
    k8sApiTunnel.id,
    k8sApiTunnel.name,
    k8sApiTunnel.secret
]).apply(([accountId, tunnelId, tunnelName, tunnelSecret]) => {
    return JSON.stringify({
        AccountTag: accountId,
        TunnelID: tunnelId,
        TunnelName: tunnelName,
        TunnelSecret: tunnelSecret
    })
})
