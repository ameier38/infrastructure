import * as k8s from '@pulumi/kubernetes'
import { originCert, originCertPrivateKey } from '../cloudflare/originCertificate'

// Traefik is deployed as part of k3s

const originCertSecret = new k8s.core.v1.Secret('origin-cert', {
    metadata: { namespace: 'kube-system' },
    stringData: {
        'tls.crt': originCert.certificate,
        'tls.key': originCertPrivateKey.privateKeyPem
    }
})

// Enables Cloudflare Full Strict SSL
new k8s.apiextensions.CustomResource('tls-store', {
    apiVersion: 'traefik.containo.us/v1alpha1',
    kind: 'TLSStore',
    metadata: {
        name: 'default',
        namespace: 'kube-system'
    },
    spec: {
        defaultCertificate: {
            secretName: originCertSecret.metadata.name
        }
    }
})
