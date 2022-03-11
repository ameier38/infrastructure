import * as digitalocean from '@pulumi/digitalocean'
import * as docker from '@pulumi/docker'

const registry = new digitalocean.ContainerRegistry('default', {
    subscriptionTierSlug: 'basic'
})

export const registryEndpoint = registry.endpoint

const writeCredentials = new digitalocean.ContainerRegistryDockerCredentials('write', {
    registryName: registry.name,
    write: true
})

const readCredentials = new digitalocean.ContainerRegistryDockerCredentials('read', {
    registryName: registry.name,
    write: false
})

// NB: used for pulling images in Kubernetes
export const dockerCredentials = readCredentials.dockerCredentials

// NB: used for pushing images
export const imageRegistry = writeCredentials.dockerCredentials.apply(creds => {
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
