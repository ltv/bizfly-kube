import axios, { AxiosRequestConfig } from 'axios'
import os from 'os'

type Spec = {
  version: string
  ex: string
  sys: string
  arch: string
}

type BizflyCredentials = {
  credentialId: string
  credentialSecret: string
}

type BizflyK8SCluster = {
  uid: string
  name: string
}

type ClustersResponse = {
  clusters: BizflyK8SCluster[]
}

const ctlUrl: {
  [key: string]: (spec: Spec) => string
} = {
  bizflyctl: ({ version, ex, sys, arch }: Spec) =>
    `https://github.com/bizflycloud/bizflyctl/releases/download/v${version}/${ex}_${sys}_${arch}.${
      sys === 'windows' ? 'zip' : 'tar.gz'
    }`,
  kubectl: ({ version, ex, sys, arch }: Spec) =>
    `https://storage.googleapis.com/kubernetes-release/release/v${version}/bin/${sys}/${arch}/${ex}`,
}

const spec = (exec: string) => (version: string) => {
  const os_type = os.type()
  const os_arch = os.arch()

  let sys = 'linux'
  let ex = exec
  let arch = 'amd64'
  if (os_arch != 'x64') arch = os_arch

  switch (os_type) {
    case 'Linux':
      sys = 'linux'
      break
    case 'Darwin':
      sys = 'darwin'
      break
    case 'Windows_NT':
      sys = 'windows'
      if (ex === 'kubectl') {
        ex = 'kubectl.exe'
      }
      break
    default:
      sys = os_type.toLowerCase()
  }

  const spec = {
    system: sys,
    architecture: arch,
    executable: ex,
    url: ctlUrl[ex]({ version, sys, arch, ex }),
  }

  return spec
}

export const kubectlSpec = spec('kubectl')
export const bizflyctlSpec = spec('bizflyctl')

const bizflyBaseUrl = 'https://manage.bizflycloud.vn/api'

const getRequestOptions = (
  credentials: BizflyCredentials,
): AxiosRequestConfig => {
  const { credentialId, credentialSecret } = credentials
  return {
    baseURL: bizflyBaseUrl,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Type': 'application_credential',
      'X-App-Credential-Id': credentialId,
      'X-App-Credential-Secret': credentialSecret,
    },
  }
}

export const obtainClusterId = async (
  clusterName: string,
  credentials: BizflyCredentials,
) => {
  const options = getRequestOptions(credentials)
  const result = await axios.get<ClustersResponse>(
    '/kubernetes-engine/_/',
    options,
  )
  const clusters = result.data.clusters || []
  const cluster = clusters.find(c => c.name === clusterName)

  if (!cluster) {
    return Promise.reject(`Cluster ${clusterName} does not exist`)
  }

  return cluster.uid
}

export const getKubernetesCredentials = async (
  clusterId: string,
  credentials: BizflyCredentials,
) => {
  const options = getRequestOptions(credentials)
  const endpoint = `/kubernetes-engine/_/${clusterId}/kubeconfig`
  const result = await axios.get<string>(endpoint, options)
  return result.data
}
