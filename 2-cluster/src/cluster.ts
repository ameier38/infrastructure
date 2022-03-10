import * as command from '@pulumi/command'
import * as pulumi from '@pulumi/pulumi'
import * as config from './config'

const installK3sMasterScript = `
echo "Installing k3s"

echo "Creating config directory"
mkdir -p /etc/rancher/k3s

cat << EOF > /etc/rancher/k3s/config.yaml
disable: traefik
EOF

curl -sfL https://get.k3s.io | sh -
`

// ref: https://developers.cloudflare.com/cloudflare-one/tutorials/kubectl/
const installCloudflaredScript = pulumi.interpolate `
echo "Installing cloudflared"

set -e

echo "Creating config directory"
mkdir -p /etc/cloudflared

echo "Writing credentials"
cat << EOF > /etc/cloudflared/credentials.json
${config.tunnelCredentials}
EOF

echo "Writing config"
cat << EOF > /etc/cloudflared/config.yml
tunnel: ${config.tunnelId}
credentials-file: /etc/cloudflared/credentials.json
ingress:
  - hostname: ${config.k8sHostname}
    service: tcp://localhost:6443
    originRequest:
      proxyType: socks
  - service: http_status:404
EOF

echo "Downloading cloudflared"
curl -sfLO https://github.com/cloudflare/cloudflared/releases/download/2022.3.1/cloudflared-linux-arm64

echo "Updating cloudflared permissions"
chmod +x cloudflared-linux-arm64

echo "Moving cloudflared to bin"
mv cloudflared-linux-arm64 /usr/local/bin/cloudflared

echo "Installing cloudflared service"
cloudflared service install

echo "Starting cloudflared service"
systemctl start cloudflared 
`

const installK3s = new command.remote.Command('install-k3s-master', {
    connection: config.masterConn,
    create: installK3sMasterScript,
    triggers: [ installK3sMasterScript ]
})

new command.remote.Command('install-cloudflared', {
    connection: config.masterConn,
    create: installCloudflaredScript,
    triggers: [ installCloudflaredScript ]
})

const readKubeconfig = new command.remote.Command('read-kubeconfig', {
    connection: config.masterConn,
    create: 'cat /etc/rancher/k3s/k3s.yaml',
    triggers: [ installK3sMasterScript ]
}, { dependsOn: installK3s })

export const kubeconfig = readKubeconfig.stdout.apply(pulumi.secret)

const readToken = new command.remote.Command('read-token', {
    connection: config.masterConn,
    create: 'cat /var/lib/rancher/k3s/server/node-token',
    triggers: [installK3sMasterScript]
}, {dependsOn: installK3s })

const token = readToken.stdout.apply(token => token.replace('\n', ''))

for (const [i, conn] of [config.agent1Conn, config.agent2Conn].entries()) {
    new command.remote.Command(`install-k3s-agent-${i}`, {
        connection: conn,
        create: pulumi.interpolate `curl -sfL https://get.k3s.io | K3S_URL="https://${config.masterConn.host}:6443" K3S_TOKEN="${token}" sh -`,
        triggers: [token]
    })
}
