# Andrew's Infrastructure

## Setup
1. Install [Pulumi](https://www.pulumi.com/docs/get-started/install/).
    ```powershell
    iex ((New-Object System.Net.WebClient).DownloadString('https://get.pulumi.com/install.ps1'))
    ```
2. Create an Auth0 Pulumi client.


## Usage
Preview the changes.
```
pulumi preview
```

Update the resources.
```
pulumi up
```
