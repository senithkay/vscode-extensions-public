/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { compile } from "handlebars";
import fetch from "node-fetch";
import { log } from "console";
import { extensions } from "vscode";
import { BallerinaTriggerRequest, BallerinaTriggerResponse } from "@wso2-enterprise/ballerina-languageclient";
import { join } from "path";
import { readFile, writeFile } from "fs";
import { runCommand } from "./component-creation-utils";

interface TriggerResponse extends BallerinaTriggerResponse {
    moduleName: string;
}

export const BAL_FORMAT_SERVICE_CMD = "bal format service.bal";
const BAL_PULL_PREFIX = "bal pull";
const GET_TRIGGERS_API = 'https://api.central.ballerina.io/2.0/registry/triggers';

const source =
    "import ballerinax/{{moduleName}};\n\n" +
    "configurable {{triggerType}}:ListenerConfig config = ?;\n\n" +
    "listener {{triggerType}}:Listener webhookListener =  new(config);\n\n" +

    "{{#each serviceTypes}}" +
    "@display {\n" +
        "label: \"{{ this.name }}\",\n" +
        "id: \"{{ this.name }}\"\n" +
    "}\n" +
    "service {{../triggerType}}:{{ this.name }} on webhookListener {\n" +
        "{{#each this.functions}}" +
            "remote function {{ this.name }}({{#each this.parameters}}{{#if @index}}, {{/if}}{{../../../triggerType}}:{{this.typeInfo.name}} {{this.name}}{{/each}}) returns error? {\n" +
                "// Not Implemented\n" +
            "}\n" +
        "{{/each}}\n" +
    "}\n\n" +
    "{{/each}}\n";

const template = compile(source);

export async function buildWebhookTemplate(pkgPath: string, triggerId: string, balVersion: string): Promise<string> {
    const triggerData: TriggerResponse | undefined = await getTrigger(triggerId, balVersion);
    if (triggerData && triggerData.serviceTypes.length) {
        const moduleName = triggerData.moduleName;
        const cmdResponse = await runCommand(`${BAL_PULL_PREFIX} ballerinax/${moduleName}`, pkgPath);
        if (!cmdResponse.error || cmdResponse.message.includes("package already exists")) {
            return template({
                ...triggerData,
                triggerType: moduleName.slice(moduleName.lastIndexOf('.') + 1)
            });
        }
    }
    return "";
}

async function getTrigger(triggerId: string, balVersion: string): Promise<TriggerResponse | undefined> {
    const extensionApi = await getBallerinaExtensionInstance();
    if (extensionApi && extensionApi.langClient) {
        const params: BallerinaTriggerRequest = { id: triggerId };
        const response: TriggerResponse = await extensionApi.langClient.getTrigger(params);
        if (response.serviceTypes?.length) {
            return response;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await (await fetch(`${GET_TRIGGERS_API}/${triggerId}`, { headers: { "User-Agent": balVersion } })).json();
    if (response && !response.error) {
        return response;
    }
    return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getBallerinaExtensionInstance(): Promise<any | undefined> {
    const ballerinaExt = extensions.getExtension("wso2.ballerina");
    if (ballerinaExt) {
        let extensionApi;
        if (!ballerinaExt.isActive) {
            extensionApi = await ballerinaExt.activate();
        } else {
            extensionApi = ballerinaExt.exports;
        }
        return extensionApi;
    }
    return undefined;
}

export function writeWebhookTemplate(pkgPath: string, template: string) {
    const serviceFilePath = join(pkgPath, "service.bal");
    readFile(serviceFilePath, 'utf-8', (err) => {
        if (err) {
            log(`Error: Could not read service.bal file.`);
            return;
        }
        writeFile(serviceFilePath, template, 'utf-8', function (err) {
            if (err) {
                log("Error: Could not write Webhook template.");
            }
        });
    });
}
