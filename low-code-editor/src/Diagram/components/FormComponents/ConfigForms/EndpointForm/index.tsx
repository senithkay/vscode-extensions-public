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
import React, { useContext, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";

import { ConfigOverlayFormStatus, ProcessConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { LocalVarDecl } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { createModuleVarDecl, getAllVariables, getInitialSource } from "../../../../utils";
import { genVariableName, getFormattedModuleName } from "../../../Portals/utils";

interface EndpointFormProps {
    config: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function EndpointForm(props: EndpointFormProps) {
    const intl = useIntl();
    const { config, onCancel, onSave, configOverlayFormStatus } = props;
    const { isLoading, error, formType: type, formArgs } = configOverlayFormStatus;
    const { targetPosition, connector } = formArgs;

    const {
        props: {
            currentFile,
            isMutationProgress: isMutationInProgress,
            stSymbolInfo,
            syntaxTree,
            importStatements,
            experimentalEnabled,
        },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram },
            insights: { onEvent },
            library,
        },
    } = useContext(Context);

    const initialModelType: string = "";
    const variableName: string = "";
    const varExpression: string = "";
    const formField: string = "Expression";
    // let initializedState;

    const [selectedType, setSelectedType] = useState(initialModelType);
    const [varName, setVarName] = useState(variableName);
    const [variableExpression, setVariableExpression] = useState<string>(varExpression);

    // const formTitle = intl.formatMessage({
    //     id: "lowcode.develop.configForms.variable.title",
    //     defaultMessage: "Variable"
    // });

    const imports = new Set<string>([`${connector.package.organization}/${connector.moduleName}`]);
    // imports.add(`${connector.package.organization}/${connector.moduleName}`);
    const moduleName = getFormattedModuleName(connector.moduleName);

    const initialSource = getInitialSource(
        createModuleVarDecl({
            varName: varName ? varName : genVariableName(`${moduleName}Ep`, getAllVariables(stSymbolInfo)),
            varOptions: [],
            varType: selectedType ? selectedType : `${moduleName}:${connector.name}`,
            varValue: variableExpression ? variableExpression : "check new ()",
        })
    );

    const handleStatementEditorChange = (partialModel: LocalVarDecl) => {
        // setSelectedType(partialModel.typedBindingPattern.typeDescriptor.source.trim())
        // setVarName(partialModel.typedBindingPattern.bindingPattern.source.trim())
        // setVariableExpression(partialModel.initializer?.source.trim())
    };

    const stmtEditorComponent = StatementEditorWrapper({
        label: "Endpoint",
        initialSource,
        formArgs: { formArgs },
        config: { type: "Custom" },
        onWizardClose: onCancel,
        onStmtEditorModelChange: handleStatementEditorChange,
        onCancel,
        currentFile,
        getLangClient: getExpressionEditorLangClient,
        applyModifications: modifyDiagram,
        library,
        syntaxTree,
        stSymbolInfo,
        extraModules: imports,
        experimentalEnabled,
    });

    return stmtEditorComponent;
}
