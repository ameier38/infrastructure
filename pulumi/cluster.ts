import * as pulumi from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'
import * as digitalocean from '@pulumi/digitalocean'
import * as config from './config'

function createKubeconfig(
    cluster: digitalocean.KubernetesCluster,
    user: pulumi.Input<string>,
    apiToken: pulumi.Input<string>,
): pulumi.Output<string> {
    return pulumi.interpolate`apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${cluster.kubeConfigs[0].clusterCaCertificate}
    server: ${cluster.endpoint}
  name: ${cluster.name}
contexts:
- context:
    cluster: ${cluster.name}
    user: ${cluster.name}-${user}
  name: ${cluster.name}
current-context: ${cluster.name}
kind: Config
users:
- name: ${cluster.name}-${user}
  user:
    token: ${apiToken}
`;
}

type ClusterArgs = {
    token: pulumi.Input<string>
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
        this.kubeconfig = createKubeconfig(cluster, 'default', args.token)

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
    token: config.digitalOceanToken,
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

export const piK8sProvider = new k8s.Provider(`${config.env}-pi-k8s-provider`, {
    kubeconfig: config.piKubeconfig,
    suppressDeprecationWarnings: true
})
