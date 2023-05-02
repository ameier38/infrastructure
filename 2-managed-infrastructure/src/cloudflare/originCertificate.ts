import * as cloudflare from '@pulumi/cloudflare'
import * as pulumi from '@pulumi/pulumi'
import * as tls from '@pulumi/tls'
import { andrewmeierDotDevDomain } from './zone'
import { cloudflareOriginCertificateProvider } from '../config'

const originCertPrivateKey = new tls.PrivateKey('origin-cert', {
    algorithm: 'RSA'
})

const originCertRequest = new tls.CertRequest('origin-cert-request', {
    privateKeyPem: originCertPrivateKey.privateKeyPem,
    subject: {
        commonName: andrewmeierDotDevDomain,
        organization: 'andrewmeier.dev'
    }
})

const originCert = new cloudflare.OriginCaCertificate('origin-cert', {
    csr: originCertRequest.certRequestPem,
    requestType: 'origin-rsa',
    hostnames: [
        andrewmeierDotDevDomain,
        pulumi.interpolate `*.${andrewmeierDotDevDomain}`
    ]
}, { provider: cloudflareOriginCertificateProvider })

export const originCertificate = originCert.certificate
export const originPrivateKey = originCertPrivateKey.privateKeyPem
