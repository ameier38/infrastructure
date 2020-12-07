import * as k8s from '@pulumi/kubernetes'
import * as cloudflare from '@pulumi/cloudflare'
import * as pulumi from '@pulumi/pulumi'
import { Regions } from '@pulumi/digitalocean'
import { piK8sProvider } from './cluster'
import { piInfrastructureNamespace } from './namespace'
import { zone } from './zone'
import * as config from './config'

type InletsArgs = {
    zoneId: pulumi.Input<string>
    namespace: pulumi.Input<string>
    version: pulumi.Input<string>
    digitalOceanToken: pulumi.Input<string>,
    license: pulumi.Input<string>
}

class Inlets extends pulumi.ComponentResource {
    loadBalancerAddress: pulumi.Output<string>

    constructor(name:string, args:InletsArgs, opts:pulumi.ComponentResourceOptions) {
        super('infrastructure:Inlets', name, {}, opts)
        let accessKeySecret = new k8s.core.v1.Secret('inlets-access-key', {
            metadata: { 
                name: 'inlets-access-key',
                namespace: args.namespace
            },
            stringData: {
                'inlets-access-key': args.digitalOceanToken
            }
        }, { parent: this })

        let crds = new k8s.yaml.ConfigFile('inlets-crds', {
            file: `https://raw.githubusercontent.com/inlets/inlets-operator/${args.version}/artifacts/crds/inlets.inlets.dev_tunnels.yaml`
        }, { parent: this })

        // ref: https://github.com/inlets/inlets-operator/tree/master/chart/inlets-operator
        const chart = new k8s.helm.v3.Chart(`${name}-inlets-operator`, {
            chart: 'inlets-operator',
            version: args.version,
            fetchOpts: { repo: 'https://inlets.github.io/inlets-operator/' },
            namespace: args.namespace,
            values: {
                provider: 'digitalocean',
                region: Regions.NYC1,
                // image: 'ameier38/inlets-operator:latest-arm32v7',
                image: 'ghcr.io/inlets/inlets-operator:latest@sha256:c20122b628f7d91d0a40b8e88a684391ff800213b775f9fe62a8dabbdf252a94',
                pullPolicy: 'Always',
                proClientImage: 'ghcr.io/inlets/inlets-pro:0.7.3@sha256:3364f78abae2fc21c9724df52ee6c75b2b553f36099411f42dcecce6839455ae',
                inletsProLicense: args.license
            }
        }, { parent: this, dependsOn: [ accessKeySecret, crds ] })

        const traefikCrds = new k8s.yaml.ConfigFile(`${name}-traefik-crds`, {
            file: './traefikCrds.yaml'
        }, { parent: this })

        const traefik = k8s.core.v1.Service.get('traefik', 'kube-system/traefik')
        this.loadBalancerAddress = traefik.spec.externalIPs[0]
    }
}

export const inlets = new Inlets(config.env, {
    zoneId: zone.id,
    namespace: piInfrastructureNamespace.metadata.name,
    version: '0.10.1',
    digitalOceanToken: config.digitalOceanToken,
    license: config.inletsLicense,
}, { provider: piK8sProvider })

export const loadBalancerAddress = inlets.loadBalancerAddress