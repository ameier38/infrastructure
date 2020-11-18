import * as pulumi from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import * as digitalocean from '@pulumi/digitalocean'
import * as config from './config'

type ClusterArgs = {
    version: pulumi.Input<string>
    defaultSize: digitalocean.DropletSlug
    defaultMinNodes: pulumi.Input<number>
    defaultMaxNodes: pulumi.Input<number>
    databaseSize: digitalocean.DropletSlug
    databaseMinNodes: pulumi.Input<number>
    databaseMaxNodes: pulumi.Input<number>
}

// ref: https://www.digitalocean.com/community/tutorials/how-to-manage-digitalocean-and-kubernetes-infrastructure-with-pulumi
class Cluster extends pulumi.ComponentResource {
    id: pulumi.Output<string>
    kubeconfig: pulumi.Output<string>
    databaseNodePoolName: pulumi.Output<string>

    constructor(name:string, args:ClusterArgs, opts:pulumi.ComponentResourceOptions) {
        super('infrastructure:Cluster', name, {}, opts)

        const cluster = new digitalocean.KubernetesCluster(`${config.env}-cluster`, {
            region: digitalocean.Regions.NYC1,
            version: args.version,
            nodePool: {
                name: 'default',
                size: args.defaultSize,
                autoScale: true,
                minNodes: args.defaultMinNodes,
                maxNodes: args.defaultMaxNodes
            }
        }, { parent: this })

        this.id = cluster.id
        this.kubeconfig = cluster.kubeConfigs[0].rawConfig

        const databaseNodePool = new digitalocean.KubernetesNodePool(`${config.env}-database`, {
            name: 'database',
            clusterId: cluster.id,
            size: args.databaseSize,
            autoScale: true,
            minNodes: args.databaseMinNodes,
            maxNodes: args.databaseMaxNodes
        })

        this.databaseNodePoolName = databaseNodePool.name

        this.registerOutputs({
            id: this.id,
            kubeconfig: this.kubeconfig,
            databaseNodePoolName: this.databaseNodePoolName
        })
    }
}

export const cluster = new Cluster('default', {
    version: '1.18.8-do.1',
    defaultSize: digitalocean.DropletSlugs.DropletS2VCPU2GB,
    defaultMinNodes: 2,
    defaultMaxNodes: 5,
    databaseSize: digitalocean.DropletSlugs.DropletS2VCPU4GB,
    databaseMinNodes: 1,
    databaseMaxNodes: 2
}, {provider: config.digitalOceanProvider})

export const k8sProvider = new k8s.Provider(`${config.env}-k8s-provider`, {
    kubeconfig: cluster.kubeconfig,
    suppressDeprecationWarnings: true
})
