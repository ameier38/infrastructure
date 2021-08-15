import * as digitalocean from '@pulumi/digitalocean'
import * as config from './config'

const sshKey = new digitalocean.SshKey('default', {
    publicKey: config.publicKey
}, { provider: config.digitalOceanProvider })

export const sshKeyId = sshKey.id
