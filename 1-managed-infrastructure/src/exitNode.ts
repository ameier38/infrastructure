import * as digitalocean from '@pulumi/digitalocean'
import * as config from './config'

// NB: service for tunneling the Ambassador gateway
const inletsAmbassadorService = `
[Unit]
Description=inlets ambassador server
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=2
StartLimitInterval=0
EnvironmentFile=/etc/default/inlets
ExecStart=/usr/local/bin/inlets-pro tcp server --auto-tls=true --auto-tls-path=/tmp/inlets-ambassador --auto-tls-san="\${IP}" --token="\${TOKEN}" --control-port=8123

[Install]
WantedBy=multi-user.target
`

// NB: service for tunneling the Kubernetes API
const inletsKubernetesService = `
[Unit]
Description=inlets kubernetes server
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=2
StartLimitInterval=0
EnvironmentFile=/etc/default/inlets
ExecStart=/usr/local/bin/inlets-pro tcp server --auto-tls=true --auto-tls-path=/tmp/inlets-kubernetes --auto-tls-san="\${IP}" --token="\${TOKEN}" --control-port=8124

[Install]
WantedBy=multi-user.target
`

// ref: https://github.com/inlets/inletsctl/blob/a301323e3beb3eae64a116b1377c107c8a51984a/pkg/provision/userdata.go#L7
const exitNodeUserData = `#!/bin/bash
cat << 'EOF' > /etc/systemd/system/inlets-ambassador.service
${inletsAmbassadorService}
EOF

cat << 'EOF' > /etc/systemd/system/inlets-kubernetes.service
${inletsKubernetesService}
EOF

export IP=$(curl -sfSL https://checkip.amazonaws.com)

curl -SLsf https://github.com/inlets/inlets-pro/releases/download/${config.inletsConfig.version}/inlets-pro > /tmp/inlets-pro && \
    chmod +x /tmp/inlets-pro && \
    mv /tmp/inlets-pro /usr/local/bin/inlets-pro

echo "IP=$IP" >> /etc/default/inlets && \
    echo "TOKEN=${config.inletsConfig.token}" >> /etc/default/inlets && \
    systemctl enable inlets-ambassador --now && \
    sleep 5 && \
    systemctl enable inlets-kubernetes --now
`

const exitNodeSshKey = new digitalocean.SshKey('exit-node', {
    publicKey: config.publicKey
}, { provider: config.digitalOceanProvider })

const exitNode = new digitalocean.Droplet('exit-node', {
    // ref: doctl compute image list --public
    image: 'ubuntu-20-04-x64',
    size: 's-1vcpu-1gb',
    region: 'nyc1',
    userData: exitNodeUserData,
    sshKeys: [exitNodeSshKey.id]
}, { provider: config.digitalOceanProvider })

export const exitNodeIp = exitNode.ipv4Address
