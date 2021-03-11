import { ballerinaExtInstance } from "../../core";
import { commands, window } from "vscode";
import { outputChannel } from "../../utils";
import {
    TM_EVENT_PROJECT_CLOUD, TM_EVENT_ERROR_EXECUTE_PROJECT_CLOUD, CMP_PROJECT_CLOUD, sendTelemetryEvent,
    sendTelemetryException
} from "../../telemetry";
import { getCurrentBallerinaProject } from "../../utils/project-utils";
import { PROJECT_TYPE } from "./cmd-runner";
import * as fs from 'fs';

const CLOUD_CONFIG_FILE_NAME = "/Cloud.toml";
const CLOUD_TOML_DEFAULT_CONTENT = `# This file contains most used configerations supported by Ballerina Code to Cloud
# All the fields are optional. If these fields are not specified, default value will be taken from the compiler.
# Full Code to Cloud specification can be accssed from https://github.com/ballerina-platform/ballerina-spec/blob/master/c2c/code-to-cloud-spec.md

# Uncomment Any field below if you want to override the default value.
#[container.image]
#name = "hello"
#repository = "local"
#tag = "v1.0.0"
#base = "ballerina/jre11:v1"
#
#[[cloud.config.envs]]
#key_ref = "FOO"
#config_name = "module-foo"
#
#[[cloud.config.files]]
#file = "resource/file.text"
#mount_path = "/home/ballerina/foo/file.conf"
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
#path = "/probe/readyz"
#
#[cloud.deployment.probes.liveness]
#port = 9090
#path = "/probe/live"
#
#[[cloud.deployment.storage.volumes]]
#name = "volume1"
#local_path = "files"
#size = "2Gi"
`;

export function activateCloudCommand() {
    // register create Cloud.toml command handler
    commands.registerCommand('ballerina.create.cloud', async () => {
        try {
            sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_PROJECT_CLOUD, CMP_PROJECT_CLOUD);

            const currentProject = await getCurrentBallerinaProject();
            if (!ballerinaExtInstance.isSwanLake) {
                const message = `Ballerina version doesn't support Cloud.toml creation.`;
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_CLOUD, CMP_PROJECT_CLOUD, message);
                window.showErrorMessage(message);
                return;
            }

            if (currentProject.kind !== PROJECT_TYPE.SINGLE_FILE) {
                if (currentProject.path) {
                    let cloudTomlPath = currentProject.path + CLOUD_CONFIG_FILE_NAME;
                    if (!fs.existsSync(cloudTomlPath)) {
                        fs.writeFile(cloudTomlPath, CLOUD_TOML_DEFAULT_CONTENT, (err) => {
                            if (err) {
                                sendTelemetryException(ballerinaExtInstance, err, CMP_PROJECT_CLOUD);
                                window.showErrorMessage(err.message);
                            } else {
                                outputChannel.appendLine(`Cloud.toml created in ${currentProject.path}`);
                            }
                        });
                    } else {
                        const message = `Cloud.toml already exists in the project.`;
                        sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_CLOUD,
                            CMP_PROJECT_CLOUD, message);
                        window.showErrorMessage(message);
                    }
                }
            } else {
                const message = `Cloud.toml is not supported for single file projects.`;
                sendTelemetryEvent(ballerinaExtInstance, TM_EVENT_ERROR_EXECUTE_PROJECT_CLOUD, CMP_PROJECT_CLOUD,
                    message);
                window.showErrorMessage(message);
            }
        } catch (error) {
            sendTelemetryException(ballerinaExtInstance, error, CMP_PROJECT_CLOUD);
            window.showErrorMessage(error);
        }
    });
}
