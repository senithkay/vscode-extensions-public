/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useContext } from "react";
import { useIntl } from "react-intl";

import { Box, FormControl } from "@material-ui/core";
import { FunctionDefinitionInfo, genVariableName, getAllVariables } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../Contexts/Diagram";
import { TextPreLoader } from "../../../../../../PreLoader/TextPreLoader";
import {
    createActionStatement,
    createCheckActionStatement,
    createCheckedRemoteServiceCall,
    createCheckedResourceServiceCall,
    createRemoteServiceCall,
    getInitialSource,
} from "../../../../../utils";
import { FormGeneratorProps } from "../../../FormGenerator";
import { wizardStyles as useFormStyles } from "../../style";
import { getDefaultParams, getFormFieldReturnType, getReturnTypeImports, isParentNodeWithErrorReturn } from "../util";

interface ActionFormProps {
    action: FunctionDefinitionInfo;
    endpointName: string;
    isClassField: boolean;
    functionNode: STNode;
    isHttp: boolean;
}

export function ActionForm(props: FormGeneratorProps) {
    const formClasses = useFormStyles();

    const intl = useIntl();
    const { model, targetPosition, onCancel, onSave, configOverlayFormStatus } = props;
    const { isLoading, formArgs } = configOverlayFormStatus;
    const { action, endpointName, isClassField, functionNode, isHttp } = formArgs as ActionFormProps;

    const {
        props: { currentFile, stSymbolInfo, fullST, experimentalEnabled, ballerinaVersion },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram, updateFileContent },
            library,
        },
    } = useContext(Context);

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.actionForm.title",
        defaultMessage: "Action",
    });

    let initialSource = "EXPRESSION";
    let imports = new Set<string>();

    if (model && model.source) {
        // Update existing endpoint
        initialSource = model.source;
    } else {
        // Adding new endpoint
        const defaultParameters = getDefaultParams(action.parameters);
        const returnType = getFormFieldReturnType(action.returnType);
        const parentWithError = isParentNodeWithErrorReturn(functionNode);
        imports = getReturnTypeImports(returnType);

        if (isHttp) {
            const path = defaultParameters.shift();
            initialSource = getInitialSource(
                createCheckedResourceServiceCall(
                    returnType.returnType,
                    genVariableName(`${action.name}Response`, getAllVariables(stSymbolInfo)),
                    endpointName,
                    action.name,
                    action.name === "get" ? "" : ".",
                    defaultParameters,
                    targetPosition,
                    action.name !== "get",
                    isClassField
                )
            );
        } else {
            initialSource = getInitialSource(
                returnType.hasReturn
                    ? returnType.hasError && parentWithError // INFO: New code actions will update parent function and `check` keyword
                        ? createCheckedRemoteServiceCall(
                              returnType.returnType,
                              genVariableName(`${action.name}Response`, getAllVariables(stSymbolInfo)),
                              endpointName,
                              action.name,
                              defaultParameters,
                              targetPosition,
                              isClassField
                          )
                        : createRemoteServiceCall(
                              returnType.returnType,
                              genVariableName(`${action.name}Response`, getAllVariables(stSymbolInfo)),
                              endpointName,
                              action.name,
                              defaultParameters,
                              targetPosition,
                              isClassField
                          )
                    : returnType.hasError && parentWithError
                    ? createCheckActionStatement(endpointName, action.name, defaultParameters, targetPosition, isClassField)
                    : createActionStatement(endpointName, action.name, defaultParameters, targetPosition, isClassField)
            );
        }
    }

    // HACK
    formArgs.targetPosition = targetPosition;

    return (
        <>
            {isLoading && (
                <FormControl className={formClasses.wizardFormControl}>
                    <Box display="flex" justifyContent="center" width="100%">
                        <TextPreLoader position="absolute" text="Loading action..." />
                    </Box>
                </FormControl>
            )}
            {!isLoading &&
                action &&
                StatementEditorWrapper({
                    label: formTitle,
                    initialSource,
                    formArgs: { formArgs },
                    config: { type: "Action" },
                    onWizardClose: onSave,
                    onCancel,
                    currentFile,
                    getLangClient: getExpressionEditorLangClient,
                    applyModifications: modifyDiagram,
                    updateFileContent,
                    library,
                    syntaxTree: fullST,
                    stSymbolInfo,
                    extraModules: imports,
                    experimentalEnabled,
                    ballerinaVersion,
                })}
        </>
    );
}
