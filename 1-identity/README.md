# Identity
Pulumi project to manage identity resources.

## Setup
1. Create a role `identity-deployer` with the following managed policies:
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
3. Create an `admin` user with the `assume-identity-deployer` policy attached.
4. Add `admin` user keys to `~/.aws/credentials` file.
5. Add profile to assume `identity-deployer` role to `~/.aws/config` file.

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
