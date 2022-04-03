import * as pulumi from '@pulumi/pulumi'
import * as command from '@pulumi/command'

export const env = pulumi.getStack()

const managedInfrastructureStack = new pulumi.StackReference('ameier38/managed-infrastructure/prod')

export const k8sApiTunnelId = managedInfrastructureStack.requireOutput('k8sApiTunnelId')
export const k8sApiTunnelCredentials = managedInfrastructureStack.requireOutput('k8sApiTunnelCredentials')
export const k8sApiTunnelHost = managedInfrastructureStack.requireOutput('k8sApiTunnelHost')

const rawConfig = new pulumi.Config()
export const privateKey = rawConfig.requireSecret('privateKey')

export const masterConn: command.types.input.remote.ConnectionArgs = {
    host: 'ameier-1',
    port: 22,
    user: 'root',
    privateKey: privateKey
}

export const agent1Conn: command.types.input.remote.ConnectionArgs = {
    host: 'ameier-2',
    port: 22,
    user: 'root',
    privateKey: privateKey
}

export const agent2Conn: command.types.input.remote.ConnectionArgs = {
    host: 'ameier-3',
    port: 22,
    user: 'root',
    privateKey: privateKey
}
