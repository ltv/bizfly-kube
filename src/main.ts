import * as core from '@actions/core'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import fs from 'fs'
import { getKubernetesCredentials, kubectlSpec, obtainClusterId } from './utils'

async function run(): Promise<void> {
  try {
    // Set working constants.
    const homeDir = process.env.HOME || ''
    const workDir = `${homeDir}/bizflytemp`
    await io.mkdirP(workDir)

    // Grab user input.
    const credentialId = core.getInput('credentialId')
    const credentialSecret = core.getInput('credentialSecret')
    const clusterName = core.getInput('clusterName')
    const namespaceName = core.getInput('namespace')
    const kubectlVersion = core.getInput('version')

    // Obtain clusterId from cluster name
    const clusterId = await obtainClusterId(clusterName, {
      credentialId,
      credentialSecret,
    })
    core.debug(`Obtained cluster id of ${clusterName}: ${clusterId}`)

    // Save kubernetes config
    const kubeconfig = await getKubernetesCredentials(clusterId, {
      credentialId,
      credentialSecret,
    }).then(config =>
      config.replace(
        /cluster:\s+(bke.*)/,
        `cluster: $1\n    namespace: ${namespaceName}`,
      ),
    )
    fs.writeFileSync(`${workDir}/kubeconfig`, kubeconfig)

    // Set KUBECONFIG environment variable.
    core.exportVariable('KUBECONFIG', `${workDir}/kubeconfig`)

    // Download and install kubectl.
    const spec = kubectlSpec(kubectlVersion)
    let kubectlDirectory = tc.find('kubectl', kubectlVersion, spec.architecture)
    if (!kubectlDirectory) {
      const kubectl = await tc.downloadTool(spec.url)
      fs.chmodSync(kubectl, 0o777)
      kubectlDirectory = await tc.cacheFile(
        kubectl,
        spec.executable,
        'kubectl',
        kubectlVersion,
        spec.architecture,
      )
    }
    core.addPath(kubectlDirectory)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
