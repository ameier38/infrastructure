import * as pulumi from '@pulumi/pulumi'
import * as bucket from './src/aws/bucket'
import * as identityProvider from './src/cloudflare/accessIdentityProvider'
import * as tunnel from './src/cloudflare/tunnel'
import * as record from './src/cloudflare/record'
import * as originCert from './src/cloudflare/originCertificate'
import * as zone from './src/cloudflare/zone'
import * as serviceToken from './src/cloudflare/serviceToken'
import './src/aws'
import './src/cloudflare'

export const logoUrl = bucket.logoUrl
export const githubServiceTokenClientId = serviceToken.githubServiceToken.clientId
export const githubServiceTokenClientSecret = pulumi.secret(serviceToken.githubServiceToken.clientSecret)
export const k8sApiTunnelId = tunnel.k8sApiTunnel.id
export const k8sApiTunnelCredentials = pulumi.secret(tunnel.k8sApiTunnel.credentials)
export const k8sApiTunnelHost = record.k8sApiRecord.hostname
export const k8sTunnelId = tunnel.k8sTunnel.id
export const k8sTunnelCredentials = tunnel.k8sTunnel.credentials
export const k8sTunnelHost = tunnel.k8sTunnel.cname
export const andrewmeierDotDevZoneId = zone.andrewmeierDotDevZoneId
export const andrewmeierDotDevDomain = zone.andrewmeierDotDevDomain
export const meiermadeDotComZoneId = zone.meiermadeDotComZoneId
export const meiermadeDotComDomain = zone.meiermadeDotComDomain
export const githubIdentityProviderId = identityProvider.githubIdentityProvider.id
export const originCertificate = pulumi.secret(originCert.originCertificate)
export const originPrivateKey = pulumi.secret(originCert.originPrivateKey)
