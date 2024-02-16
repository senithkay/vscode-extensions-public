/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { existsSync, readFile, unlinkSync, writeFileSync } from "fs";
import * as path from "path";
import child_process from "child_process";
import { compile } from "handlebars";
import { BallerinaTriggerResponse, Parameter, ServiceType } from "@wso2-enterprise/ballerina-languageclient";
import { BallerinaComponentTypes, TriggerDetails } from "@wso2-enterprise/choreo-core";
import { ExtendedLangClient } from "../../../../core";
import { CommandResponse, DEFAULT_SERVICE_TEMPLATE_SUFFIX, GRAPHQL_SERVICE_TEMPLATE_SUFFIX } from "../../../../project-design-diagrams/resources";
import { StateMachine } from "../../../../stateMachine";

export function createBallerinaPackage(name: string, pkgRoot: string, type: BallerinaComponentTypes): Promise<CommandResponse> {
    const cmd = `bal new "${name}" ${getBalCommandSuffix(type)}`;
    return runCommand(cmd, pkgRoot);
}

export function getBalCommandSuffix(componentType: BallerinaComponentTypes): string {
    switch (componentType) {
        case BallerinaComponentTypes.GRAPHQL:
            return GRAPHQL_SERVICE_TEMPLATE_SUFFIX;
        case BallerinaComponentTypes.REST_API:
        case BallerinaComponentTypes.WEBHOOK:
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
    const dependenciesTomlPath = path.join(pkgRoot, 'Dependencies.toml');
    if (existsSync(dependenciesTomlPath)) {
        unlinkSync(dependenciesTomlPath);
    }

    // Update org and version in Ballerina.toml   
    const balToml: string = path.join(pkgRoot, 'Ballerina.toml');
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

export function addDisplayAnnotation(pkgPath: string, label: string, id: string, type: BallerinaComponentTypes): boolean {
    let didFail: boolean;
    const serviceFileName = type === BallerinaComponentTypes.GRAPHQL ? 'sample.bal' : 'service.bal';
    const serviceFilePath = path.join(pkgPath, serviceFileName);
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

const triggerSource =
    "import ballerinax/{{moduleName}};\n\n" +
    "{{#if listenerConfigName}}" +
    "configurable {{triggerType}}:{{listenerConfigName}} config = ?;\n\n" +
    "{{/if}}" +
    "listener {{triggerType}}:Listener webhookListener =  new({{#if listenerConfigName}}config{{/if}});\n\n" +

    "{{#each selectedServices}}" +
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

export async function buildWebhookTemplate(pkgPath: string, trigger: TriggerDetails): Promise<string> {
    const langClient: ExtendedLangClient = StateMachine.langClient();
    const template = compile(triggerSource);
    const triggerData: BallerinaTriggerResponse | {} = await langClient.getTrigger({ id: trigger.id });
    if ('serviceTypes' in triggerData && triggerData.serviceTypes.length) {
        const selectedServices = getFilteredTriggerData(triggerData, trigger.services);
        const listenerConfigName = getTriggerListenerConfigName(triggerData.listenerParams);
        const moduleName = triggerData.moduleName;
        const cmdResponse = await runCommand(`bal pull ballerinax/${moduleName}`, pkgPath);
        if (!cmdResponse.error || cmdResponse.message.includes("package already exists")) {
            return template({
                ...triggerData,
                triggerType: moduleName.slice(moduleName.lastIndexOf('.') + 1),
                selectedServices,
                listenerConfigName
            });
        }
    }
    return "";
}

function getFilteredTriggerData(triggerData: BallerinaTriggerResponse, services: string[] | undefined): ServiceType[] {
    if (triggerData && triggerData.serviceTypes.length && services) {
        return triggerData.serviceTypes.filter((service) => services.includes(service.name));
    }
    return [];
}

function getTriggerListenerConfigName(listenerParams: Parameter[]): string | undefined {
    if (listenerParams && listenerParams.length > 1) {
        const listener = listenerParams.find((param) => param.name !== "listenOn" && param.typeName === "record");
        if (listener && listener.typeInfo) {
            return listener.typeInfo.name;
        }
    }
    return undefined;
}

export function writeWebhookTemplate(pkgPath: string, template: string): boolean {
    let didFail: boolean;
    const serviceFilePath = path.join(pkgPath, 'service.bal');
    readFile(serviceFilePath, 'utf-8', (err) => {
        if (err) {
            didFail = true;
            return;
        }
        writeFileSync(serviceFilePath, template);
    });
    return didFail;
}
