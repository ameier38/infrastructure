# Cluster
Kubernetes cluster for running workloads.

Uses a hybrid setup (cloud managed and locally managed servers) using [k3s](https://k3s.io/).

## Usage
Preview changes.
```
pulumi preview
```

Apply changes.
```
pulumi up
```

## Add Local Node
Get the k3s master host and token from the stack outputs.
```
pulumi stack output --show-secrets
```
```
Current stack outputs (3):
    OUTPUT         VALUE
    k3sMasterHost  <ip address>
    k3sToken       <token>
```

Connect to the local node.
```
ssh pi@raspberrypi-1
``` 

Install the k3s agent service.
```
curl -sfL https://get.k3s.io | K3S_URL=https://<ip adress from above>:6443 K3S_TOKEN=<token from above> sh -
```
