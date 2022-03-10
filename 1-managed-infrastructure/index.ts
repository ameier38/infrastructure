import * as pulumi from '@pulumi/pulumi'
import * as bucket from './src/bucket'
import * as dockerRegistry from './src/dockerRegistry'
import * as tunnel from './src/tunnel'
import * as record from './src/record'
import * as identityProvider from './src/identityProvider'
import * as zone from './src/zone'
import * as auth from './src/auth'

export const githubServiceTokenClientId = auth.githubServiceTokenClientId
export const githubServiceTokenClientSecret = pulumi.secret(auth.githubServiceTokenClientSecret)
export const k8sTunnelId = tunnel.k8sTunnelId
export const k8sTunnelHost = tunnel.k8sTunnelHost
export const k8sTunnelCredentials = pulumi.secret(tunnel.k8sTunnelCredentials)
export const k8sApiTunnelId = tunnel.k8sApiTunnelId
export const k8sApiTunnelHost = tunnel.k8sApiTunnelHost
export const k8sApiTunnelCredentials = pulumi.secret(tunnel.k8sApiTunnelCredentials)
export const k8sApiHostname = record.k8sApiHostname
export const logoUrl = bucket.logoUrl
export const registryEndpoint = dockerRegistry.registryEndpoint
export const dockerCredentials = pulumi.secret(dockerRegistry.dockerCredentials)
export const imageRegistry = pulumi.secret(dockerRegistry.imageRegistry)
export const githubIdentityProviderId = identityProvider.githubIdentityProviderId
export const andrewmeierDotDevZoneId = zone.andrewmeierDotDevZoneId
