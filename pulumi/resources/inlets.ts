import * as digitalocean from '@pulumi/digitalocean'
import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import { DropletSlugs, Regions } from '@pulumi/digitalocean'
import { infrastructureNamespace } from './namespace'
import * as ambassador from './ambassador'
import * as config from './config'

const inletsProVersion = '0.7.2'
const inletsProImageTag = '0.7.3'

// NB: used for tunneling the k8s API
const inletsProService = `
[Unit]
Description=inlets pro server
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=2
StartLimitInterval=0
EnvironmentFile=/etc/default/inlets-pro
ExecStart=/usr/local/bin/inlets-pro server --auto-tls --common-name="\${IP}" --token="\${TOKEN}" --listen ":8123"

[Install]
WantedBy=multi-user.target
`

// ref: https://github.com/inlets/inletsctl/blob/a301323e3beb3eae64a116b1377c107c8a51984a/pkg/provision/userdata.go#L7
const userData = `#!/bin/bash
cat << 'EOF' > /etc/systemd/system/inlets-pro.service
${inletsProService}
EOF

export IP=$(curl -sfSL https://checkip.amazonaws.com)

curl -SLsf https://github.com/inlets/inlets-pro/releases/download/${inletsProVersion}/inlets-pro > /tmp/inlets-pro && \
    chmod +x /tmp/inlets-pro && \
    mv /tmp/inlets-pro /usr/local/bin/inlets-pro

echo "IP=$IP" >> /etc/default/inlets-pro && \
    echo "TOKEN=${config.inletsConfig.token}" >> /etc/default/inlets-pro && \
    systemctl enable inlets-pro --now
`

const sshKey = new digitalocean.SshKey('inlets', {
    publicKey: config.inletsConfig.publicKey
}, { provider: config.digitalOceanProvider })

const k8sExitNode = new digitalocean.Droplet('k8s-exit-node', {
    // ref: doctl compute image list --public
    image: 'ubuntu-20-04-x64',
    size: DropletSlugs.DropletS1VCPU1GB,
    region: Regions.NYC1,
    userData: userData,
    sshKeys: [sshKey.id]
}, { provider: config.digitalOceanProvider })

const ambassadorExitNode = new digitalocean.Droplet('ambassador-exit-node', {
    // ref: doctl compute image list --public
    image: 'ubuntu-20-04-x64',
    size: DropletSlugs.DropletS1VCPU1GB,
    region: Regions.NYC1,
    userData: userData,
    sshKeys: [sshKey.id]
}, { provider: config.digitalOceanProvider })

export const k8sExitNodeIp = k8sExitNode.ipv4Address
export const ambassadorExitNodeIp = ambassadorExitNode.ipv4Address

const labels = { 'app.kubernetes.io/name': 'inlets' }

new k8s.apps.v1.Deployment('inlets', {
    metadata: { namespace: infrastructureNamespace.metadata.name },
    spec: {
        selector: { matchLabels: labels },
        replicas: 1,
        template: {
            metadata: { labels: labels },
            spec: {
                containers: [{
                    name: 'inlets',
                    image: `inlets/inlets-pro:${inletsProImageTag}`,
                    imagePullPolicy: 'IfNotPresent',
                    command: ['inlets-pro'],
                    args: [
                        'client',
                        pulumi.interpolate `--url=wss://${ambassadorExitNodeIp}:8123/connect`,
                        `--token=${config.inletsConfig.token}`,
                        pulumi.interpolate `--upstream=${ambassador.internalHost}`,
                        '--ports=80,443',
                        `--license=${config.inletsConfig.license}`
                    ],
                    resources: {
                        limits: { memory: '128Mi' },
                        requests: { cpu: '25m', memory: '25Mi' }
                    }
                }]
            }
        }
    }
}, { provider: config.k8sProvider })
