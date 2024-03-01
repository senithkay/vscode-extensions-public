/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BallerinaProjectComponents, ComponentInfo } from "../rpc-types/lang-server/interfaces";

function convertToCamelCase(variableName: string): string {
    return variableName
        .replace(/\s(.)/g, (a) => {
            return a.toUpperCase();
        })
        .replace(/\s/g, "")
        .replace(/^(.)/, (b) => {
            return b.toLowerCase();
        });
}

export function genVariableName(defaultName: string, variables: string[], skipCamelCase?: boolean): string {
    const baseName: string = skipCamelCase ? defaultName : convertToCamelCase(defaultName);
    let varName: string = baseName.includes(".") ? baseName.split(".").pop() : baseName;
    let index = 0;
    while (variables.includes(varName)) {
        index++;
        varName = baseName + index;
    }
    return varName;
}

export function getAllVariablesForAi(projectComponents: BallerinaProjectComponents): { [key: string]: any } {
    const variableCollection: { [key: string]: any } = {};
    projectComponents.packages?.forEach((packageSummary) => {
        packageSummary.modules.forEach((moduleSummary) => {
            moduleSummary.moduleVariables.forEach(({ name }: ComponentInfo) => {
                if (!variableCollection[name]) {
                    variableCollection[name] = {
                        type: name,
                        position: 0,
                        isUsed: 0,
                    };
                }
            });
            moduleSummary.enums.forEach(({ name }: ComponentInfo) => {
                if (!variableCollection[name]) {
                    variableCollection[name] = {
                        type: name,
                        position: 0,
                        isUsed: 0,
                    };
                }
            });
            moduleSummary.records.forEach(({ name }: ComponentInfo) => {
                if (!variableCollection[name]) {
                    variableCollection[name] = {
                        type: name,
                        position: 0,
                        isUsed: 0,
                    };
                }
            });
        })
    });
    return variableCollection;
}

export function getAllVariables(projectComponents: BallerinaProjectComponents): string[] {
    const variableCollection: string[] = [];
    const variableInfo = getAllVariablesForAi(projectComponents);
    Object.keys(variableInfo).map((variable) => {
        variableCollection.push(variable);
    });
    return variableCollection;
}
