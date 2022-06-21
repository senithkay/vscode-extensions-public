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
import { useContext } from "react";

import { BallerinaConnectorInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";

import { Context } from "../../../../../../Contexts/Diagram";
import {
    createCheckObjectDeclaration,
    createObjectDeclaration,
    getAllVariables,
    getInitialSource,
} from "../../../../../utils";
import { genVariableName, getFormattedModuleName } from "../../../../Portals/utils";
import { FormGeneratorProps } from "../../../FormGenerator";
import { getDefaultParams, getFormFieldReturnType } from "../util";

interface EndpointFormProps {
    connector: BallerinaConnectorInfo;
}

export function EndpointForm(props: FormGeneratorProps) {

    const { model, targetPosition, onCancel, onSave, configOverlayFormStatus } = props;
    const { isLoading, formArgs } = configOverlayFormStatus;
    const { connector } = formArgs as EndpointFormProps;

    const {
        props: { currentFile, stSymbolInfo, syntaxTree, experimentalEnabled },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram },
            library,
        },
    } = useContext(Context);

    // const formTitle = Intl.formatMessage({
    //     id: "lowcode.develop.configForms.endpointForm.title",
    //     defaultMessage: "Endpoint"
    // });

    const imports = new Set<string>([`${connector.package.organization}/${connector.moduleName}`]);
    const moduleName = getFormattedModuleName(connector.moduleName);
    let initialSource = "EXPRESSION";

    if (model && model.source) {
        // Update existing endpoint
        initialSource = model.source;
    } else {
        // Adding new endpoint
        const initFunction = (connector as BallerinaConnectorInfo).functions?.find((func) => func.name === "init");
        const defaultParameters = getDefaultParams(initFunction.parameters);
        const returnType = getFormFieldReturnType(initFunction.returnType);

        initialSource = getInitialSource(
            returnType.hasError
                ? createCheckObjectDeclaration(
                      `${moduleName}:${connector.name}`,
                      genVariableName(`${moduleName}Ep`, getAllVariables(stSymbolInfo)),
                      defaultParameters,
                      targetPosition
                  )
                : createObjectDeclaration(
                      `${moduleName}:${connector.name}`,
                      genVariableName(`${moduleName}Ep`, getAllVariables(stSymbolInfo)),
                      defaultParameters,
                      targetPosition
                  )
        );
    }

    // HACK
    formArgs.targetPosition = targetPosition;

    const stmtEditorComponent = StatementEditorWrapper({
        label: "Endpoint",
        initialSource,
        formArgs: { formArgs },
        config: { type: "Custom" },
        onWizardClose: onSave,
        onCancel,
        currentFile,
        getLangClient: getExpressionEditorLangClient,
        applyModifications: modifyDiagram,
        library,
        syntaxTree,
        stSymbolInfo,
        extraModules: imports,
        isLoading,
        experimentalEnabled,
    });

    return stmtEditorComponent;
}
