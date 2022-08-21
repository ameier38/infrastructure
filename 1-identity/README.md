# Identity Stack
Pulumi project to manage identity resources.

## Setup
1. Create `identity-deployer` role in AWS console with the following managed policies:
    - `IAMFullAccess`
    - `AWSKeyManagementServicePowerUser`

    and the following trust policy:
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": "400689721046"
                },
                "Action": "sts:AssumeRole"
            },
            {
                "Effect": "Allow",
                "Principal": {
                    "Federated": "arn:aws:iam::400689721046:oidc-provider/token.actions.githubusercontent.com"
                },
                "Action": "sts:AssumeRoleWithWebIdentity",
                "Condition": {
                    "StringEquals": {
                        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                    },
                    "StringLike": {
                        "token.actions.githubusercontent.com:sub": "repo:ameier38/infrastructure:*"
                    }
                }
            }
        ]
    }
    ```
2. Create a policy `assume-identity-deployer`:
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "sts:AssumeRole",
                "Resource": "arn:aws:iam::400689721046:role/identity-deployer"
            }
        ]
    }
    ```
3. Create a user `admin` with the `assume-identity-deployer` policy attached.

## Usage
Make sure you have assumed the `identity-deployer` AWS role.

Preview changes.
```
pulumi preview
```

Apply changes.
```
pulumi up
```
