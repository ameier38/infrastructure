import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as config from '../config'

new k8s.apiextensions.CustomResource('traefik-dashboard', {
    apiVersion: 'traefik.containo.us/v1alpha1',
    kind: 'IngressRoute',
    metadata: { namespace: 'kube-system' },
    spec: {
        entryPoints: ['web'],
        routes: [{
            kind: 'Rule',
            match: pulumi.interpolate `Host(\`${config.traefikHost}\`)`,
            services: [{
                kind: 'TraefikService',
                name: 'api@internal'
            }]
        }]
    }
})
