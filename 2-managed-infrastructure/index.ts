import * as pulumi from '@pulumi/pulumi'
import * as tunnel from './src/cloudflare/tunnel'
import * as record from './src/cloudflare/record'
import * as zone from './src/cloudflare/zone'
import { githubServiceToken } from './src/cloudflare/serviceToken'
import './src/aws'
import './src/cloudflare'

export const githubServiceTokenClientId = githubServiceToken.clientId
export const githubServiceTokenClientSecret = pulumi.secret(githubServiceToken.clientSecret)
export const k8sTunnelId = tunnel.k8sTunnel.id
export const k8sTunnelHost = tunnel.k8sTunnel.host
export const k8sTunnelCredentials = pulumi.secret(tunnel.k8sTunnel.credentials)
export const k8sApiTunnelId = tunnel.k8sApiTunnel.id
export const k8sApiTunnelCredentials = pulumi.secret(tunnel.k8sApiTunnel.credentials)
export const k8sApiTunnelHost = record.k8sApiRecord.hostname
export const andrewmeierDotDevZoneId = zone.andrewmeierDotDevZoneId
export const andrewmeierDotDevDomain = zone.andrewmeierDotDevDomain
export const traefikHost = record.traefikRecord.hostname
export const grafanaHost = record.grafanaRecord.hostname
export const whoamiHost = record.whoamiRecord.hostname
export const blogHost = record.andrewmeierRecord.hostname
