import * as digitalocean from '@pulumi/digitalocean'
import * as pulumi from '@pulumi/pulumi'
import * as ssh from 'ssh2'
import * as config from './config'
import { Provisioner } from './provisioner'
import { sshKeyId } from './ssh'

type ReadFileProps =
    { host: pulumi.Input<string>
      port: pulumi.Input<number>
      user: pulumi.Input<string>
      privateKey: pulumi.Input<string>
      path: pulumi.Input<string> }

function readRemoteFile(props:pulumi.Unwrap<ReadFileProps>): Promise<string> {
    return new Promise((resolve, reject) => {
        let connectionFailureCount = 0
        let executeFailureCount = 0
        const conn = new ssh.Client()
        function connect() {
            conn.on('ready', () => {
                function execute() {
                    conn.exec(`cat ${props.path}`, (err, stream) => {
                        if (err) {
                            executeFailureCount++
                            pulumi.log.info(`remote execute failure ${executeFailureCount}: ${err.message}`)
                            if (executeFailureCount > 10) {
                                pulumi.log.info('remote execute failure limit exceded')
                                reject(err)
                                return;
                            } else {
                                setTimeout(execute, executeFailureCount * 1000)
                            }
                        }
                        let stdout = ""
                        stream.on('close', (code:string, _:any) => {
                            if (code) {
                                reject(new Error(`Command exited with code ${code}`))
                            } else {
                                resolve(stdout)
                            }
                        }).on('data', (data:Buffer) => {
                            stdout += data.toString('utf-8')
                        })
                    })
                }
                execute()
            }).on('error', err => {
                connectionFailureCount++
                pulumi.log.info(`remote connect failure ${connectionFailureCount}: ${err.message}`)
                if (connectionFailureCount > 10) {
                    pulumi.log.info('remote connect failure limit exceded')
                    reject(err)
                } else {
                    setTimeout(connect, connectionFailureCount * 1000)
                }
            }).connect({
                host: props.host,
                port: 22,
                username: props.user,
                privateKey: props.privateKey
            })
        }
        connect()
    })
}

type K3sMasterArgs = {
    sshKeyId: pulumi.Input<string>
    privateKey: pulumi.Input<string>
}

const k3sMasterUserData = `#!/bin/bash
mkdir -p /etc/rancher/k3s

cat << EOF > /etc/rancher/k3s/config.yaml
disable: traefik
EOF

curl -sfL https://get.k3s.io | sh -
`

class K3sMaster extends pulumi.ComponentResource {
    private readonly kubeconfigProvisioner: Provisioner<ReadFileProps,string>
    private readonly tokenProvisioner: Provisioner<ReadFileProps,string>
    public readonly host: pulumi.Output<string>
    public readonly kubeconfig: pulumi.Output<string>
    public readonly token: pulumi.Output<string>

    constructor(name:string, args:K3sMasterArgs, opts?:pulumi.ComponentResourceOptions) {
        super('cluster:K3sMaster', name, args, opts)

        const identifier = `${name}-k3s-master`

        const droplet = new digitalocean.Droplet(identifier, {
            // ref: doctl compute image list --public
            image: 'ubuntu-20-04-x64',
            size: 's-1vcpu-2gb',
            region: 'nyc1',
            // NB: stored at /var/lib/cloud/instance/user-data.txt
            userData: k3sMasterUserData,
            sshKeys: [args.sshKeyId]
        }, { parent: this })

        this.host = droplet.ipv4Address

        this.kubeconfigProvisioner = new Provisioner<ReadFileProps,string>(`${identifier}-kubeconfig-provisioner`, {
            dep: {
                host: droplet.ipv4Address,
                port: 22,
                user: 'root',
                privateKey: args.privateKey,
                path: '/etc/rancher/k3s/k3s.yaml'
            },
            onCreate: props => readRemoteFile(props)
        }, { parent: this })

        this.kubeconfig =
            pulumi
                .all([this.kubeconfigProvisioner.result, this.host])
                .apply(([kubeconfig, host]) => {
                    if (kubeconfig) {
                        return kubeconfig.replace('127.0.0.1', host)
                    } else {
                        return ''
                    }
                })

        this.tokenProvisioner = new Provisioner<ReadFileProps,string>(`${identifier}-token-provisioner`, {
            dep: {
                host: droplet.ipv4Address,
                port: 22,
                user: 'root',
                privateKey: args.privateKey,
                path: '/var/lib/rancher/k3s/server/node-token'
            },
            onCreate: props => readRemoteFile(props)
        }, { parent: this })

        this.token = this.tokenProvisioner.result
    }
}

type K3sAgentArgs = {
    sshKeyId: pulumi.Input<string>
    masterHost: pulumi.Input<string>
    token: pulumi.Input<string>
}

const k3sAgentUserData = (host:pulumi.Input<string>, token:pulumi.Input<string>) =>
    pulumi.interpolate `#!/bin/bash
curl -sfL https://get.k3s.io | K3S_URL="https://${host}:6443" K3S_TOKEN="${token}" sh -
`

class K3sAgent extends pulumi.ComponentResource {
    public readonly host: pulumi.Output<string>

    constructor(name:string, args:K3sAgentArgs, opts?:pulumi.ComponentResourceOptions) {
        super('cluster:K3sAgent', name, args, opts)

        const identifier = `${name}-k3s-agent`

        const droplet = new digitalocean.Droplet(identifier, {
            // ref: doctl compute image list --public
            image: 'ubuntu-20-04-x64',
            size: 's-1vcpu-2gb',
            region: 'nyc1',
            // NB: stored at /var/lib/cloud/instance/user-data.txt
            userData: k3sAgentUserData(args.masterHost, args.token),
            sshKeys: [args.sshKeyId]
        }, { parent: this })

        this.host = droplet.ipv4Address
    }
}

type K3sClusterArgs = {
    nodeCount: number
    sshKeyId: pulumi.Input<string>,
    privateKey: pulumi.Input<string>
}

class K3sCluster extends pulumi.ComponentResource {
    public readonly masterHost: pulumi.Output<string>
    public readonly kubeconfig: pulumi.Output<string>
    public readonly token: pulumi.Output<string>
    constructor(name:string, args:K3sClusterArgs, opts?:pulumi.ComponentResourceOptions) {
        super('cluster:K3sCluster', name, args, opts)
        if (args.nodeCount < 1) {
            throw new Error('node count must be greater than 0')
        }
        const k3sMaster = new K3sMaster(name, {
            sshKeyId: args.sshKeyId,
            privateKey: args.privateKey
        }, { parent: this })

        for (const i of Array(args.nodeCount - 1).keys()) {
            new K3sAgent(`${name}-${i}`, {
                sshKeyId: args.sshKeyId,
                masterHost: k3sMaster.host,
                token: k3sMaster.token
            }, { parent: this })
        }

        this.masterHost = k3sMaster.host
        this.kubeconfig = k3sMaster.kubeconfig
        this.token = k3sMaster.token
    }
}

const cluster = new K3sCluster('default', {
    nodeCount: 2,
    sshKeyId: sshKeyId,
    privateKey: config.privateKey
}, { provider: config.digitalOceanProvider })

export const kubeconfig = pulumi.secret(cluster.kubeconfig)
export const token = pulumi.secret(cluster.token)
export const k3sMasterHost = cluster.masterHost
