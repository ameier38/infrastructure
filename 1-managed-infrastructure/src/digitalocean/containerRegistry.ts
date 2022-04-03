import * as digitalocean from '@pulumi/digitalocean'

const registry = new digitalocean.ContainerRegistry('default', {
    subscriptionTierSlug: 'basic'
})

export const registryName = registry.name
export const registryServer = registry.serverUrl

const writeCredentials = new digitalocean.ContainerRegistryDockerCredentials('write', {
    registryName: registry.name,
    write: true
})

const readCredentials = new digitalocean.ContainerRegistryDockerCredentials('read', {
    registryName: registry.name,
    write: false
})

// NB: used for pulling images in Kubernetes
export const dockerconfigjson = readCredentials.dockerCredentials

// NB: used for pushing images
const authParts = writeCredentials.dockerCredentials.apply(creds => {
    const auth = JSON.parse(creds)['auths']['registry.digitalocean.com']['auth']
    const decoded = Buffer.from(auth, 'base64').toString('utf8')
    const parts = decoded.split(':')
    if (parts.length != 2) {
        throw new Error('Invalid credentials')
    }
    return parts
})

export const registryUser = authParts.apply(parts => parts[0])
export const registryPassword = authParts.apply(parts => parts[1])
