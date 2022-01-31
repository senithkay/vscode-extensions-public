/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React from "react";

import { ConnectorConfig, FormField, FormFieldReturnType, STModification, STSymbolInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, ModulePart, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { getAllVariables } from "../../../utils/mixins";
import { createImportStatement, createPropertyStatement, createQueryWhileStatement, updateFunctionSignature } from "../../../utils/modification-util";
import { genVariableName } from "../../Portals/utils";
import * as Forms from "../ConfigForms";
import { FormFieldChecks } from "../Types";

export function getForm(type: string, args: any) {
    const Form = (Forms as any)[type];
    return Form ? (
        <Form {...args} />
    ) : <Forms.Custom {...args}/>;
}

export function isAllEmpty(allFieldChecks: Map<string, FormFieldChecks>): boolean {
    let result = true
    allFieldChecks?.forEach((fieldChecks, key) => {
        if (!fieldChecks.isEmpty) {
            result = false;
        }
    });
    return result;
}

export function isAllIgnorable(fields: FormField[]): boolean {
    let result = true;
    fields?.forEach((field, key) => {
        if (!(field.optional || field.defaultable)) {
            result = false;
        }
    });
    return result;
}

export function isAllDefaultableFields(recordFields: FormField[]): boolean {
    return recordFields?.every((field) => field.defaultable || (field.fields && isAllDefaultableFields(field.fields)));
}

export function isAllFieldsValid(allFieldChecks: Map<string, FormFieldChecks>, model: FormField | FormField[], isRoot: boolean): boolean {
    let result = true;
    let canModelIgnore = false;
    let allFieldsIgnorable = false;

    if (!isRoot) {
        const formField = model as FormField;
        canModelIgnore = formField.optional || formField.defaultable;
        allFieldsIgnorable = isAllIgnorable(formField.fields);
    }else{
        const formFields = model as FormField[];
        allFieldsIgnorable = isAllIgnorable(formFields);
    }

    allFieldChecks?.forEach(fieldChecks => {
        if (!canModelIgnore && !fieldChecks.canIgnore && (!fieldChecks.isValid || fieldChecks.isEmpty)) {
            result = false;
        }
        if (fieldChecks.canIgnore && !fieldChecks.isEmpty && !fieldChecks.isValid) {
            result = false;
        }
    });

    return result;
}

const BALLERINA_CENTRAL_ROOT = 'https://lib.ballerina.io';

export function generateDocUrl(org: string, module: string, method: string) {
    return method
        ? `${BALLERINA_CENTRAL_ROOT}/${org}/${module}/latest/clients/Client#${method}`
        : `${BALLERINA_CENTRAL_ROOT}/${org}/${module}/latest/clients/Client`
}

export function updateFunctionSignatureWithError(modifications: STModification[], activeFunction: FunctionDefinition) {
    const parametersStr = activeFunction.functionSignature.parameters.map((item) => item.source).join(",");
    let returnTypeStr = activeFunction.functionSignature.returnTypeDesc?.source.trim();

    if (returnTypeStr?.includes("?") || returnTypeStr?.includes("()")) {
        returnTypeStr = returnTypeStr + "|error";
    } else if (returnTypeStr) {
        returnTypeStr = returnTypeStr + "|error?";
    } else {
        returnTypeStr = "returns error?";
    }

    const functionSignature = updateFunctionSignature(activeFunction.functionName.value, parametersStr, returnTypeStr, {
        ...activeFunction.functionSignature.position,
        startColumn: activeFunction.functionName.position.startColumn,
    });
    if (functionSignature) {
        modifications.push(functionSignature);
    }
}

export function addReturnTypeImports(modifications: STModification[], returnType: FormFieldReturnType) {
    if (returnType.importTypeInfo) {
        returnType.importTypeInfo?.forEach((typeInfo) => {
            const addImport: STModification = createImportStatement(typeInfo.orgName, typeInfo.moduleName, {
                startColumn: 0,
                startLine: 0,
            });
            const existsMod = modifications.find(
                (modification) => JSON.stringify(addImport) === JSON.stringify(modification)
            );
            if (!existsMod) {
                modifications.push(addImport);
            }
        });
    }
}

export function checkDBConnector(connectorModule: string): boolean {
    const dbConnectors = ["mysql", "mssql", "postgresql", "oracledb"]
    if (dbConnectors.includes(connectorModule)) {
        return true;
    }
    return false;
}

export function addDbExtraImport(modifications: STModification[], syntaxTree: STNode, orgName: string, moduleName: string) {
    let importCounts: number = 0;
    if (STKindChecker.isModulePart(syntaxTree)) {
        (syntaxTree as ModulePart).imports?.forEach((imp) => {
            if (
                imp.typeData?.symbol.id.orgName === orgName &&
                imp.typeData?.symbol.id.moduleName === `${moduleName}.driver`
            ) {
                importCounts = importCounts + 1;
            }
        });
        if (importCounts === 0) {
            if (checkDBConnector(moduleName)) {
                const addDriverImport: STModification = createImportStatement(orgName, `${moduleName}.driver as _`, {
                    startColumn: 0,
                    startLine: 0,
                });
                modifications.push(addDriverImport);
            }
        }
    }
}

export function addDbExtraStatements(
    modifications: STModification[],
    config: ConnectorConfig,
    stSymbolInfo: STSymbolInfo,
    targetPosition: NodePosition,
    isAction: boolean
) {
    if (config.action.name === "query") {
        const resultUniqueName = genVariableName("recordResult", getAllVariables(stSymbolInfo));
        const returnTypeName = config.action.returnVariableName;
        const addQueryWhileStatement = createQueryWhileStatement(resultUniqueName, returnTypeName, targetPosition);
        modifications.push(addQueryWhileStatement);

        const closeStreamStatement = `check ${returnTypeName}.close();`;
        const addCloseStreamStatement = createPropertyStatement(closeStreamStatement, targetPosition);
        modifications.push(addCloseStreamStatement);
    }
    if (!isAction) {
        const resp = config.name;
        const closeStatement = `check ${resp}.close();`;
        const addCloseStatement = createPropertyStatement(closeStatement, targetPosition);
        modifications.push(addCloseStatement);
    }
}
