import * as pulumi from '@pulumi/pulumi'
import * as command from '@pulumi/command'

export const env = pulumi.getStack()

const managedInfrastructureStack = new pulumi.StackReference('ameier38/managed-infrastructure/prod')

export const tunnelId = managedInfrastructureStack.requireOutput('k8sApiTunnelId')
export const tunnelHost = managedInfrastructureStack.requireOutput('k8sApiTunnelHost')
export const tunnelCredentials = managedInfrastructureStack.requireOutput('k8sApiTunnelCredentials')
export const k8sHostname = managedInfrastructureStack.requireOutput('k8sApiHostname')

const rawConfig = new pulumi.Config()
export const privateKey = rawConfig.requireSecret('privateKey')

export const masterConn: command.types.input.remote.ConnectionArgs = {
    host: 'raspberrypi-1',
    port: 22,
    user: 'root',
    privateKey: privateKey
}

export const agent1Conn: command.types.input.remote.ConnectionArgs = {
    host: 'raspberrypi-2',
    port: 22,
    user: 'root',
    privateKey: privateKey
}

export const agent2Conn: command.types.input.remote.ConnectionArgs = {
    host: 'raspberrypi-3',
    port: 22,
    user: 'root',
    privateKey: privateKey
}
