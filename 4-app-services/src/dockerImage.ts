import * as docker from '@pulumi/docker'
import * as pulumi from '@pulumi/pulumi'
import * as path from 'path'
import * as config from './config'

const cloudflaredArm64 = new docker.Image('cloudflared-arm64', {
    imageName: pulumi.interpolate `${config.registryEndpoint}/cloudflared-arm64`,
    build: {
        context: path.join(config.rootDir, 'docker'),
        dockerfile: path.join(config.rootDir, 'docker', 'cloudflared-arm64.Dockerfile'),
        extraOptions: ['--quiet', '--platform', 'linux/arm64']
    },
    registry: config.imageRegistry
})

export const cloudflaredArm64ImageName = cloudflaredArm64.imageName
