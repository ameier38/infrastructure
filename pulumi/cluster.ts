import * as pulumi from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import * as digitalocean from '@pulumi/digitalocean'
import * as config from './config'

type ClusterArgs = {
    version: pulumi.Input<string>
    size: digitalocean.DropletSlug
    minNodes: pulumi.Input<number>
    maxNodes: pulumi.Input<number>
}

// ref: https://www.digitalocean.com/community/tutorials/how-to-manage-digitalocean-and-kubernetes-infrastructure-with-pulumi
class Cluster extends pulumi.ComponentResource {
    id: pulumi.Output<string>
    kubeconfig: pulumi.Output<string>

    constructor(name:string, args:ClusterArgs, opts:pulumi.ComponentResourceOptions) {
        super('infrastructure:Cluster', name, {}, opts)

        const cluster = new digitalocean.KubernetesCluster(`${config.env}-cluster`, {
            region: digitalocean.Regions.NYC1,
            version: args.version,
            nodePool: {
                name: 'default',
                autoScale: true,
                minNodes: args.minNodes,
                maxNodes: args.maxNodes,
                size: args.size
            }
        }, { parent: this })

        this.id = cluster.id

        this.kubeconfig = cluster.kubeConfigs[0].rawConfig

        this.registerOutputs({
            id: this.id,
            kubeconfig: this.kubeconfig
        })
    }
}

export const cluster = new Cluster('default', {
    version: '1.18.8-do.1',
    size: digitalocean.DropletSlugs.DropletS2VCPU2GB,
    minNodes: 2,
    maxNodes: 5
}, {provider: config.digitalOceanProvider})

export const k8sProvider = new k8s.Provider(`${config.env}-k8s-provider`, {
    kubeconfig: cluster.kubeconfig,
    suppressDeprecationWarnings: true
})
