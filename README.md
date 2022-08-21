[![Identity Merge](https://github.com/ameier38/infrastructure/actions/workflows/1_identity_merge.yml/badge.svg)](https://github.com/ameier38/infrastructure/actions/workflows/1_identity_merge.yml)
[![Managed Infrastructure Merge](https://github.com/ameier38/infrastructure/actions/workflows/2_managed_infrastructure_merge.yml/badge.svg)](https://github.com/ameier38/infrastructure/actions/workflows/2_managed_infrastructure_merge.yml)
[![Cluster Services Merge](https://github.com/ameier38/infrastructure/actions/workflows/4_cluster_services_merge.yml/badge.svg)](https://github.com/ameier38/infrastructure/actions/workflows/4_cluster_services_merge.yml)
[![Managed Apps Merge](https://github.com/ameier38/infrastructure/actions/workflows/6_managed_apps_merge.yml/badge.svg)](https://github.com/ameier38/infrastructure/actions/workflows/6_managed_apps_merge.yml)

# Andrew's Infrastructure
Based on [Pulumi's Kubernetes Playbook](https://www.pulumi.com/docs/guides/crosswalk/kubernetes/playbooks/).

## Setup
Install [Pulumi](https://www.pulumi.com/docs/get-started/install/).

```powershell
iex ((New-Object System.Net.WebClient).DownloadString('https://get.pulumi.com/install.ps1'))
```

## Stacks
1. [Identity](./1-identity): Users, roles, and keys.
2. [Managed Infrastructure](./2-managed-infrastructure): Docker regisitry, S3 Buckets, DNS, etc.
3. [Cluster](./3-cluster): Kubernetes cluster using k3s.
4. [Cluster Services](./4-cluster-services): Namespaces and cluster wide services such as Prometheus and Loki.
5. [App Services](./5-app-services): Resources used by apps such as databases.
6. [Managed Apps](./6-managed-apps): Managed applications such as Grafana.
