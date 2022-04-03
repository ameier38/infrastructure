[![Managed Infrastructure Merge](https://github.com/ameier38/infrastructure/actions/workflows/1_managed_infrastructure_merge.yml/badge.svg)](https://github.com/ameier38/infrastructure/actions/workflows/1_managed_infrastructure_merge.yml)
[![Cluster Services Merge](https://github.com/ameier38/infrastructure/actions/workflows/3_cluster_services_merge.yml/badge.svg)](https://github.com/ameier38/infrastructure/actions/workflows/3_cluster_services_merge.yml)
[![Managed Apps Merge](https://github.com/ameier38/infrastructure/actions/workflows/5_managed_apps_merge.yml/badge.svg)](https://github.com/ameier38/infrastructure/actions/workflows/5_managed_apps_merge.yml)

# Andrew's Infrastructure
Based on [Pulumi's Kubernetes Playbook](https://www.pulumi.com/docs/guides/crosswalk/kubernetes/playbooks/).

## Setup
Install [Pulumi](https://www.pulumi.com/docs/get-started/install/).

```powershell
iex ((New-Object System.Net.WebClient).DownloadString('https://get.pulumi.com/install.ps1'))
```

## Stacks
1. [Managed Infrastructure](./1-managed-infrastructure): Docker regisitry, S3 Buckets, DNS, etc.
2. [Cluster](./2-cluster): Kubernetes cluster using k3s.
3. [Cluster Services](./3-cluster-services): Namespaces and cluster wide services such as Prometheus and Loki.
4. [App Services](./4-app-services): Resources used by apps such as databases.
5. [Managed Apps](./5-managed-apps): Managed applications such as Grafana.
