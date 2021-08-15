// ref: https://github.com/pulumi/examples/blob/master/aws-ts-ec2-provisioners/provisioners/provisioner.ts

import * as pulumi from '@pulumi/pulumi'
import { v4 as uuidv4 } from 'uuid'

export interface ProvisionerProps<T, U> {
    // NB: dependent property; will rerun anytime the value changes
    dep: pulumi.Input<T>;
    onCreate: (dep: pulumi.Unwrap<T>) => Promise<pulumi.Unwrap<U>>;
}

interface State<T, U> {
    dep: pulumi.Unwrap<T>;
    result: pulumi.Unwrap<U>;
}
// Provisioner lets a custom action run the first time a resource has been created. It takes as input
// a dependent property. Anytime its value changes, the resource is replaced and will re-run its logic.
export class Provisioner<T, U> extends pulumi.dynamic.Resource {
    dep!: pulumi.Output<T>;
    result!: pulumi.Output<U>;
    constructor(name: string, props: ProvisionerProps<T, U>, opts?: pulumi.CustomResourceOptions) {
        const provider: pulumi.dynamic.ResourceProvider = {
            diff: async (id: pulumi.ID, olds: State<T, U>, news: State<T, U>) => {
                let replace = false;
                let replacementProperties = [];
                if (JSON.stringify(olds.dep) !== JSON.stringify(news.dep)) {
                    replace = true;
                    replacementProperties.push("dep");
                }
                return {
                    changes: replace,
                    replaces: replace ? replacementProperties : undefined,
                    deleteBeforeReplace: true,
                };
            },
            create: async (inputs: State<T, U>) => {
                const result = await props.onCreate(inputs.dep);
                if (result !== undefined) {
                    inputs.result = result;
                }
                return { id: uuidv4(), outs: inputs };
            },
        };
        super(provider, name, { dep: props.dep, result: null }, opts);
    }
}
