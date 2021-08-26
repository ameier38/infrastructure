# Cluster Services
Pulumi project for Kubernetes cluster services such as 
Ambassador, Prometheus, Grafana, Seq, and Inlets.

## Usage
Preview changes.
```
pulumi preview
```

Apply changes.
```
pulumi up
```

## Expose Local Application
```
inlets http client --auto-tls=false --url=wss://inlets.andrewmeier.dev --upstream=http://localhost:5000 --license-file=<path> --token=<token>
```
> The service at http://localhost:5000 will also be available at https://demo.andrewmeier.dev
