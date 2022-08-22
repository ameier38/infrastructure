import * as cloudflare from '@pulumi/cloudflare'
import * as pulumi from '@pulumi/pulumi'
import * as tls from '@pulumi/tls'
import * as config from '../config'

export const originCertPrivateKey = new tls.PrivateKey('origin-cert', {
    algorithm: 'RSA'
})

const originCertRequest = new tls.CertRequest('origin-cert-request', {
    privateKeyPem: originCertPrivateKey.privateKeyPem,
    subject: {
        commonName: config.andrewmeierDotDevDomain,
        organization: 'andrewmeier.dev'
    }
})

export const originCert = new cloudflare.OriginCaCertificate('origin-cert', {
    csr: originCertRequest.certRequestPem,
    requestType: 'origin-rsa',
    hostnames: [
        config.andrewmeierDotDevDomain,
        pulumi.interpolate `*.${config.andrewmeierDotDevDomain}`
    ]
})
