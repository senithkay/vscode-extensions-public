/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { existsSync, readFile, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import child_process from "child_process";
import { compile } from "handlebars";
import { BallerinaTriggerResponse } from "@wso2-enterprise/ballerina-languageclient";
import { ChoreoServiceComponentType } from "@wso2-enterprise/choreo-core";
import { ExtendedLangClient } from "../../core";
import { getLangClient } from "../activator";
import { CommandResponse, DEFAULT_SERVICE_TEMPLATE_SUFFIX, GRAPHQL_SERVICE_TEMPLATE_SUFFIX } from "../resources";


const triggerSource =
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

export function createBallerinaPackage(name: string, pkgRoot: string, type: ChoreoServiceComponentType): Promise<CommandResponse> {
    const cmd = `bal new "${name}" ${getBalCommandSuffix(type)}`;
    return runCommand(cmd, pkgRoot);
}

export function getBalCommandSuffix(componentType: ChoreoServiceComponentType): string {
    switch (componentType) {
        case ChoreoServiceComponentType.GRAPHQL:
            return GRAPHQL_SERVICE_TEMPLATE_SUFFIX;
        case ChoreoServiceComponentType.REST_API:
        case ChoreoServiceComponentType.PROXY:
        case ChoreoServiceComponentType.WEBHOOK:
            return DEFAULT_SERVICE_TEMPLATE_SUFFIX;
        default:
            return '';
    }
}

export async function runCommand(cmd: string, cwd?: string): Promise<CommandResponse> {
    return new Promise(function (resolve) {
        child_process.exec(`${cmd}`, { cwd: cwd }, async (err, stdout, stderror) => {
            if (err) {
                resolve({
                    error: true,
                    message: stderror
                });
            } else {
                resolve({
                    error: false,
                    message: stdout
                });
            }
        });
    });
}

export function processTomlFiles(pkgRoot: string, orgName: string, version: string): boolean {
    let didFail: boolean;

    // Remove Dependencies.toml
    const dependenciesTomlPath = join(pkgRoot, 'Dependencies.toml');
    if (existsSync(dependenciesTomlPath)) {
        unlinkSync(dependenciesTomlPath);
    }

    // Update org and version in Ballerina.toml   
    const balToml: string = join(pkgRoot, 'Ballerina.toml');
    readFile(balToml, 'utf-8', function (err, contents) {
        if (err) {
            didFail = true;
            return;
        }
        let replaced = contents.replace(/org = "[a-z,A-Z,0-9,_]+"/, `org = \"${orgName}\"`);
        replaced = replaced.replace(/version = "[0-9].[0-9].[0-9]"/, `version = "${version}"`);
        writeFileSync(balToml, replaced);
    });
    return didFail;
}

export function getAnnotatedContent(content: string, label: string, serviceId: string): string {
    const preText = 'service / on new';
    const processedText = `@display {\n\tlabel: "${label}",\n\tid: "${serviceId}"\n}\n${preText}`;
    return content.replace(preText, processedText);
}

export function addDisplayAnnotation(pkgPath: string, label: string, id: string, type: ChoreoServiceComponentType): boolean {
    let didFail: boolean;
    const serviceFileName = type === ChoreoServiceComponentType.GRAPHQL ? 'sample.bal' : 'service.bal';
    const serviceFilePath = join(pkgPath, serviceFileName);
    readFile(serviceFilePath, 'utf-8', (err, contents) => {
        if (err) {
            didFail = true;
            return;
        }
        const replaced = getAnnotatedContent(contents, label, id);
        writeFileSync(serviceFilePath, replaced);
    });
    return didFail;
}

export async function buildWebhookTemplate(pkgPath: string, triggerId: string): Promise<string> {
    const langClient: ExtendedLangClient = getLangClient();
    const template = compile(triggerSource);
    const triggerData: BallerinaTriggerResponse | {} = await langClient.getTrigger({ id: triggerId });
    if ('serviceTypes' in triggerData && triggerData.serviceTypes.length) {
        const moduleName = triggerData.moduleName;
        const cmdResponse: CommandResponse = await runCommand(`bal pull ballerinax/${moduleName}`, pkgPath);
        if (!cmdResponse.error || cmdResponse.message.includes('package already exists')) {
            return template({
                ...triggerData,
                triggerType: moduleName.slice(moduleName.lastIndexOf('.') + 1)
            });
        }
    }
    return "";
}

export function writeWebhookTemplate(pkgPath: string, template: string): boolean {
    let didFail: boolean;
    const serviceFilePath = join(pkgPath, "service.bal");
    readFile(serviceFilePath, 'utf-8', (err) => {
        if (err) {
            didFail = true;
            return;
        }
        writeFileSync(serviceFilePath, template);
    });
    return didFail;
}
