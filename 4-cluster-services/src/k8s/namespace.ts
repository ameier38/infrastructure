import * as k8s from '@pulumi/kubernetes'

const createNamespace = (name:string) => {
    const namespace = new k8s.core.v1.Namespace(name, {
        metadata: { name: name },
    })
    new k8s.core.v1.LimitRange(name, {
        spec: {
            limits: [{
                type: 'Container',
                default: { memory: '512Mi' },
                defaultRequest: { memory: '512Mi' }
            }]
        }
    }, { dependsOn: namespace})
    return namespace.metadata.name
}

export const monitoringNamespace = createNamespace('monitoring')
export const ackmxNamespace = createNamespace('ackmx')
export const andrewmeierNamespace = createNamespace('andrewmeier')
export const meiermadeNamespace = createNamespace('meiermade')
