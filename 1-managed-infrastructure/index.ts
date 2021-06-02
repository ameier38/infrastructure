import * as pulumi from '@pulumi/pulumi'
import * as config from './src/config'
import * as logo from './src/logo'
import * as dockerRegistry from './src/dockerRegistry'
import * as exitNode from './src/exitNode'
import * as identity from './src/identity'
import * as dns from './src/dns'

export const zone = config.zone
export const zoneId = dns.zoneId
export const emailClaim = config.emailClaim
export const acmeEmail = config.acmeEmail
export const inletsVersion = config.inletsConfig.version
export const inletsToken = pulumi.secret(config.inletsConfig.token)
export const inletsLicense = pulumi.secret(config.inletsConfig.license)
export const logoUrl = logo.logoUrl
export const registryEndpoint = dockerRegistry.registryEndpoint
export const dockerCredentials = pulumi.secret(dockerRegistry.dockerCredentials)
export const imageRegistry = pulumi.secret(dockerRegistry.imageRegistry)
export const exitNodeIp = exitNode.exitNodeIp
export const authUrl = config.auth0Config.authUrl
export const gatewayClientId = pulumi.secret(identity.gatewayClientId)
export const gatewayClientSecret = pulumi.secret(identity.gatewayClientSecret)
export const gatewayClientAudience = identity.gatewayClientAudience
