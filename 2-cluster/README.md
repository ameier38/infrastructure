# Cluster
Kubernetes cluster for running workloads.

## Setup
1. Follow [this tutorial](https://github.com/alexellis/k3sup#-micro-tutorial-for-raspberry-pi-2-3-or-4-)
to install k3s on Raspberry Pis using [k3sup](https://github.com/alexellis/k3sup).
2. Get the exit node IP address from the managed infrastructure stack.
    ```
    ❯ pulumi stack output
    Current stack outputs (11):
        OUTPUT                    VALUE
        ambassadorClientAudience  https://ameier38.auth0.com/api/v2/
        ambassadorClientId        [secret]
        ambassadorClientSecret    [secret]
        dockerCredentials         [secret]
        exitNodeIp                64.227.21.216
        imageRegistry             [secret]
        inletsLicense             [secret]
        inletsToken               [secret]
        inletsVersion             0.8.4
        logoUrl                   https://upload-eda2337.nyc3.digitaloceanspaces.com/logo.png
        registryEndpoint          registry.digitalocean.com/default-6fa985f
    ```
3. SSH onto the master node of your Kubernetes cluster.
    ```
    ssh pi@raspberrypi-1
    ```
4. Download `inletsctl`.
    ```
    curl -sLSf https://inletsctl.inlets.dev | sh
    ```
5. Install `inlets-pro`.
    ```
    inletsctl download --pro
    ```
6. Create a LICENSE file.
    ```
    echo <license> > .inlets/LICENSE
    ```
7. Generate a systemd service file.
    ```
    inlets-pro client \
        --url wss://64.227.21.216:8124 \
        --upstream localhost \
        --ports 6443 \
        --token <token> \
        --generate systemd \
        > inlets.service
    ```
8. Move service into systemd service directory.
    ```
    sudo mv inlets.service /etc/systemd/system/
    ```
9. Reload service files.
    ```
    sudo systemctl daemon-reload
    ```
10. Enable the inlets service.
    ```
    sudo systemctl enable inlets --now
    ```
11. Check the inlets client.
    ```
    systemctl status inlets
    ```
    > To debug any issues run `journalctl -u inlets`

