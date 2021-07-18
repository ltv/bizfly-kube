# Bizfly Kubernetes GitHub Action

Fetches the config for your Bizfly Kubernetes Cluster, then installs and configures `kubectl`, exposing it to path for future use!

[![GitHub Release](https://img.shields.io/github/v/release/ltv/bizfly-kube)](https://github.com/ltv/bizfly-kube/releases/latest)

For help updating, view the [change logs](https://github.com/ltv/bizfly-kube/releases).

## Runs on

| Type                | Systems                                                                                       | Note                                                                                       |
| :------------------ | :-------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| GitHub Runners      | `ubuntu-16.04`, `ubuntu-18.04`, `ubuntu-20.04`, `macos-10.15`, `windows-2016`, `windows-2019` | _All available GitHub hosted runners._                                                     |
| Self-Hosted Runners | `linux-amd64`, `linux-arm64`, `linux-s390x`, `macOS-x64`, `windows-x64`                       | _Not tested, but in theory should work as long as `kubectl` is available for your system._ |

## Inputs

| Name               | Requirement    | Description                                                                                                                                                          |
| :----------------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `credentialId`     | **Required**   | A Bizfly Application credential id, create [here](https://manage.bizflycloud.vn/account/security).                                                                   |
| `credentialSecret` | **Required**   | A Bizfly Application credential secret, create [here](https://manage.bizflycloud.vn/account/security).                                                               |
| `clusterName`      | **Required**   | The name of the cluster you are trying to operate on. This was chosen during the _"Choose a name"_ step when originally creating the cluster.                        |
| `version`          | **_Optional_** | The kubectl version to use. Remember to omit "v" prefix, for example: `1.21.3`. Defaults to `1.21.3`. _See [example](#specifying-a-specific-kubectl-version) below_. |
| `namespace`        | **_Optional_** | The Kubernetes namespace to operate under. Defaults to `default`.                                                                                                    |

## Example usage

### Simple, minimal usage

```yaml
- name: Set up kubectl
  uses: ltv/bizfly-kube@v1
  with:
    credentialId: ${{ secrets.BIZFLY_CREDENTIAL_ID }}
    credentialSecret: ${{ secrets.BIZFLY_CREDENTIAL_SECRET }}
    clusterName: my-fabulous-cluster

- name: Get nodes
  run: kubectl get nodes
```

This will setup `kubectl` configured with your Bizfly Kubernetes cluster. After that you're free to use `kubectl` as you wish!

### Specifying a specific kubectl version

```yaml
- name: Set up kubectl
  uses: ltv/bizfly-kube@v1
  with:
    credentialId: ${{ secrets.BIZFLY_CREDENTIAL_ID }}
    credentialSecret: ${{ secrets.BIZFLY_CREDENTIAL_SECRET }}
    clusterName: my-fabulous-cluster
    version: '1.17.4'

- name: Get nodes
  run: kubectl get nodes
```
