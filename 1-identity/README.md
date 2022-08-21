# Identity Stack
Pulumi project to manage identity resources.

## Setup
1. Create `identity-deployer` role in AWS console with `IAMFullAccess` and `AWSKeyManagementServicePowerUser` policies.
2. Create a policy `assume-identity-deployer`:
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "sts:AssumeRole",
                "Resource": "arn:aws:iam::{accountId}:role/identity-deployer"
            }
        ]
    }
    ```
3. Create a user `admin` with the `assume-identity-deployer` policy attached.

## Usage
Make sure you have assumed the `identity-deployer` AWS roles.

Preview changes.
```
pulumi preview
```

Apply changes.
```
pulumi up
```
