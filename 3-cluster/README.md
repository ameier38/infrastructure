# Cluster
Kubernetes cluster for running workloads.

Uses [k3s](https://k3s.io/) on Raspberry Pis in my apartment.

## Setup
1. Flash Raspberry Pi OS Lite 64 bit to flash drive
2. Add file called `ssh` to `/boot` folder on flash drive.
3. Power on Raspberry Pi and connect to ethernet (do one at a time).
3. Connect to Raspberry Pi via `ssh pi@<ip address>`. Default password is `raspberry`.
4. Run `sudo raspi-config`
5. Change password for `pi` user.
6. Change hostname to `raspberrypi-<index>`
7. Change GPU memory to 16
8. Exit config (do not reboot)
9. Open boot command `sudo vi /boot/cmdline.txt` and add `cgroup_enable=cpuset cgroup_enable=memory cgroup_memory=1` to the end of the first line (Needed for k3s). 
10. Open ssh config `sudo vi /etc/ssh/sshd_config` and update the following lines.
    ```
    PubkeyAuthentication yes
    PasswordAuthentication yes
    PermitEmptyPasswords no
    PermitRootLogin yes
    ```
11. Change the root password `sudo passwd`
11. Restart Raspberry Pi `sudo shutdown -r now`
12. Copy public key to Raspberry Pi `cat ~/.ssh/id_rsa.pub | ssh pi@raspberrypi-<index> "mkdir ~/.ssh; cat >> ~/.ssh/authorized_keys"`
13. Copy public key to Raspberry Pi root `cat ~/.ssh/id_rsa.pub | ssh root@raspberrypi-<index> "mkdir ~/.ssh; cat >> ~/.ssh/authorized_keys"`

## Usage
Must be able to connect to local network.
Make sure you have assumed the `infrastructure-deployer` AWS role.

Preview changes.
```
pulumi preview
```

Apply changes.
```
pulumi up
```

## Outputs
Get the `kubeconfig`.
```
pulumi stack output kubeconfig --show-secrets > ~/.kube/kubeconfig
```
