import * as digitalocean from '@pulumi/digitalocean'
import * as config from './config'

const cluster = new digitalocean.KubernetesCluster('default', {
    version: '1.21.2-do.2',
    region: 'nyc1',
    nodePool: {
        name: 'default',
        size: 's-1vcpu-2gb',
        nodeCount: 3
    }
}, { provider: config.digitalOceanProvider })

export const kubeconfig = cluster.kubeConfigs[0].rawConfig
