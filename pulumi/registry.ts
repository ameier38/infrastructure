import * as pulumi from '@pulumi/pulumi'
import * as digitalocean from '@pulumi/digitalocean'
import * as docker from '@pulumi/docker'
import * as config from './config'

export class Registry extends pulumi.ComponentResource {
    endpoint: pulumi.Output<string>
    dockerCredentials: pulumi.Output<string>
    imageRegistry: pulumi.Output<docker.ImageRegistry>

    constructor(name:string, opts:pulumi.ComponentResourceOptions) {
        super('infrastructure:Registry', name, {}, opts)

        const registry = new digitalocean.ContainerRegistry(name, {
            subscriptionTierSlug: 'basic'
        }, { parent: this })

        this.endpoint = registry.endpoint
        
        const writeCredentials = new digitalocean.ContainerRegistryDockerCredentials(`${name}-write`, {
            registryName: registry.name,
            write: true
        }, { parent: this })

        const readCredentials = new digitalocean.ContainerRegistryDockerCredentials(`${name}-read`, {
            registryName: registry.name,
            write: false
        }, { parent: this })

        // NB: used for pulling images in Kubernetes
        this.dockerCredentials = readCredentials.dockerCredentials

        // NB: used for pushing images
        this.imageRegistry = writeCredentials.dockerCredentials.apply(creds => {
            const auth = JSON.parse(creds)['auths']['registry.digitalocean.com']['auth']
            const decoded = Buffer.from(auth, 'base64').toString('ascii')
            const parts = decoded.split(':')
            if (parts.length != 2) {
                throw new Error(`Invalid credentials: ${decoded}`)
            }
            return {
                server: registry.serverUrl,
                username: parts[0],
                password: parts[1]
            } as docker.ImageRegistry
        })

        this.registerOutputs({
            endpoint: this.endpoint,
            dockerCredentials: this.dockerCredentials,
            imageRegistry: this.imageRegistry,
        })
    }
}

export const registry = new Registry(config.env, { provider: config.digitalOceanProvider })
