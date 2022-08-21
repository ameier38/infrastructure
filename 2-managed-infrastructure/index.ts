import * as pulumi from '@pulumi/pulumi'
import * as tunnel from './src/cloudflare/tunnel'
import * as record from './src/cloudflare/record'
import * as identityProvider from './src/cloudflare/accessIdentityProvider'
import * as zone from './src/cloudflare/zone'
import * as serviceToken from './src/cloudflare/serviceToken'
import './src/cloudflare'

export const githubServiceTokenClientId = serviceToken.githubServiceTokenClientId
export const githubServiceTokenClientSecret = pulumi.secret(serviceToken.githubServiceTokenClientSecret)
export const k8sTunnelId = tunnel.k8sTunnelId
export const k8sTunnelHost = tunnel.k8sTunnelHost
export const k8sTunnelCredentials = pulumi.secret(tunnel.k8sTunnelCredentials)
export const k8sApiTunnelId = tunnel.k8sApiTunnelId
export const k8sApiTunnelCredentials = pulumi.secret(tunnel.k8sApiTunnelCredentials)
export const k8sApiTunnelHost = record.k8sApiTunnelHost
export const githubIdentityProviderId = identityProvider.githubIdentityProviderId
export const andrewmeierDotDevZoneId = zone.andrewmeierDotDevZoneId
export const andrewmeierDotDevDomain = zone.andrewmeierDotDevDomain
export const traefikHost = record.traefikHost
export const grafanaHost = record.grafanaHost
export const whoamiHost = record.whoamiHost
export const blogHost = record.blogHost
