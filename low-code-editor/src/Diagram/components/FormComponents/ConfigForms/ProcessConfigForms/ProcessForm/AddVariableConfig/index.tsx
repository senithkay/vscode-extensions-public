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
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect } from "react";
import { useIntl } from "react-intl";

import { ProcessConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { LocalVarDecl, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../../Contexts/Diagram";
import { getAllVariables } from "../../../../../../utils/mixins";
import { createModuleVarDecl, createModuleVarDeclWithoutInitialization, getInitialSource } from "../../../../../../utils/modification-util";
import { getVariableNameFromST } from "../../../../../../utils/st-util";
import { genVariableName } from "../../../../../Portals/utils";

interface AddVariableConfigProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddVariableConfig(props: AddVariableConfigProps) {
    const intl = useIntl();
    const { config, formArgs, onCancel, onWizardClose } = props;

    const {
        props: {
            currentFile,
            stSymbolInfo,
            syntaxTree,
            importStatements,
            experimentalEnabled
        },
        api: {
            ls: { getExpressionEditorLangClient },
            code: {
                modifyDiagram
            },
            insights: { onEvent },
            library
        }
    } = useContext(Context);

    let initialModelType: string = '';
    let variableName: string = '';
    let varExpression: string = '';
    let initializedState;

    const existingProperty = config && config.model;
    if (existingProperty && STKindChecker.isLocalVarDecl(config.model)) {
        const localVarDec: LocalVarDecl = config.model as LocalVarDecl;
        const typeDescriptor = localVarDec.typedBindingPattern.typeDescriptor;
        // tslint:disable-next-line:prefer-conditional-expression
        if (STKindChecker.isIntTypeDesc(typeDescriptor) || STKindChecker.isFloatTypeDesc(typeDescriptor) ||
            STKindChecker.isDecimalTypeDesc(typeDescriptor) || STKindChecker.isBooleanTypeDesc(typeDescriptor) ||
            STKindChecker.isStringTypeDesc(typeDescriptor) || STKindChecker.isJsonTypeDesc(typeDescriptor) ||
            STKindChecker.isVarTypeDesc(typeDescriptor) || STKindChecker.isAnyTypeDesc(typeDescriptor) ||
            STKindChecker.isAnydataTypeDesc(typeDescriptor)) {
            initialModelType = typeDescriptor.name.value;
        } else {
            initialModelType = typeDescriptor.source.trim();
        }
        variableName = getVariableNameFromST(config?.model);
        varExpression = localVarDec?.initializer?.source || '';
        initializedState = localVarDec?.initializer ? true : false;
    } else {
        variableName = '';
        varExpression = '';
        initializedState = true;
    }

    // Insight event to send when loading the component
    useEffect(() => {
        // const event: LowcodeEvent = {
        //     type: ADD_VARIABLE,
        //     name: config.config
        // };
        // onEvent(event);
    }, []);

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.title",
        defaultMessage: "Variable"
    });

    const initialSource = initializedState ? (
                getInitialSource(createModuleVarDecl(
                    {
                        varName: variableName ? variableName : genVariableName("variable", getAllVariables(stSymbolInfo)),
                        varOptions: [],
                        varType: initialModelType ? initialModelType : "var",
                        varValue: varExpression ? varExpression : "EXPRESSION"
                    }
                ))
            ) :
            (
                getInitialSource(createModuleVarDeclWithoutInitialization(
                    {
                        varName: variableName ? variableName : genVariableName("variable", getAllVariables(stSymbolInfo)),
                        varOptions: [],
                        varType: initialModelType ? initialModelType : "var",
                        varValue: null
                    }
                ))
            );

    const stmtEditorComponent = StatementEditorWrapper(
        {
            label: formTitle,
            initialSource,
            formArgs: { formArgs },
            config,
            onWizardClose,
            onCancel,
            currentFile,
            getLangClient: getExpressionEditorLangClient,
            applyModifications: modifyDiagram,
            library,
            syntaxTree,
            stSymbolInfo,
            importStatements,
            experimentalEnabled
        }
    );

    return stmtEditorComponent;
}
