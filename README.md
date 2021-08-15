# Andrew's Infrastructure
Repo for my infrastructure. Check out [my post](https://andrewmeier.dev/personal-infrastructure)
which describes the hardware setup. Loosely based on
[Pulumi's Kubernetes Playbook](https://www.pulumi.com/docs/guides/crosswalk/kubernetes/playbooks/).

## Setup
Install [Pulumi](https://www.pulumi.com/docs/get-started/install/).

```powershell
iex ((New-Object System.Net.WebClient).DownloadString('https://get.pulumi.com/install.ps1'))
```

## Stacks
1. [Managed Infrastructure](./1-managed-infrastructure): Docker regisitry, S3 Buckets, DNS records, etc.
2. [Cluster](./2-cluster): Hybrid Kubernetes cluster using k3s.
3. [Cluster Services](./3-cluster-services): Tools such as Ambassador, Prometheus, Grafana, and Seq.
