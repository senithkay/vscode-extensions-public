import { ballerinaExtInstance } from "../../core";
import { commands, window } from "vscode";
import { getCLIOutputChannel } from "./output";
import { TM_EVENT_CREATE_K8S, CMP_K8S } from "../../telemetry";
import { getCurrentBallerinaProject } from "../../utils/project-utils";
import { PROJECT_TYPE } from "./../cli-cmds/cmd-runner";
import * as fs from 'fs';

const CLOUD_CONFIG_FILE_NAME = "/Kubernetes.toml"
const KUBERNETES_TOML_DEFAULT_CONTENT = `# This file contains most used configerations supported by Ballerina Code to Cloud
# All the fields are optional. If these fields are not specified, default value will be taken from the compiler.
# Full Code to Cloud specification can be accssed from https://github.com/ballerina-platform/ballerina-spec/blob/master/c2c/code-to-cloud-spec.md

# Uncomment Any field below if you want to override the default value.
#[container.image]
#name = "hello"
#repository = "local"
#tag = "v1.0.0"
#base = "openjdk:slim"
#
#[[cloud.config.envs]]
#key_ref = "FOO"
#config_name = "module-foo"
#
#[[cloud.config.files]]
#file = "resource/ballerina.conf"
#mount_path = "/home/ballerina/foo/ballerina.conf"
#
#[cloud.deployment]
#external_accessible = true
#max_cpu = "100Mi"
#max_memory = "256Mi"
#min_cpu = "1000m"
#max_cpu = "1500m"
#
#[cloud.deployment.autoscaling]
#enable = true
#min_replicas = 2
#max_replicas = 3
#cpu = 50
#memory = 80
#
#[cloud.deployment.probes.readiness]
#port = 9090
#path = "/service/readyz"
#
#[cloud.deployment.probes.liveness]
#port = 9090
#path = "/service/live"
#
#[[cloud.deployment.storage.volumes]]
#name = "volume1"
#local_path = "files"
#size = "2Gi"
`

export function activateK8sCommand() {
    const reporter = ballerinaExtInstance.telemetryReporter;

    // register create kubernetes.toml command handler
    commands.registerCommand('ballerina.create.k8s', async () => {
        try {
            reporter.sendTelemetryEvent(TM_EVENT_CREATE_K8S, { component: CMP_K8S });
            const currentProject = await getCurrentBallerinaProject();
            const outputChannel = getCLIOutputChannel();
            if (currentProject.kind !== PROJECT_TYPE.SINGLE_FILE) {
                if (currentProject.path) {
                    let k8sTomlPath = currentProject.path + CLOUD_CONFIG_FILE_NAME
                    if (!fs.existsSync(k8sTomlPath)) {
                        fs.writeFile(k8sTomlPath, KUBERNETES_TOML_DEFAULT_CONTENT, (err) => {
                            if (err) {
                                reporter.sendTelemetryException(err, { component: CMP_K8S });
                                window.showErrorMessage(err.message);
                            } else {
                                outputChannel.appendLine("Kubernetes.toml created in " + currentProject.path)
                            }
                        });
                    } else {
                        window.showErrorMessage("Kubernetes.toml already exists in the project")
                    }
                }
            } else {
                window.showErrorMessage("Kubernetes.toml is not supported for single file projects")
            }
        } catch (error) {
            reporter.sendTelemetryException(error, { component: CMP_K8S });
            window.showErrorMessage(error);
        }
    });
}
