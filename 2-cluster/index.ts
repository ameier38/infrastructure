import * as pulumi from '@pulumi/pulumi'
import * as cluster from './src/cluster'

export const kubeconfig = pulumi.secret(cluster.kubeconfig)
