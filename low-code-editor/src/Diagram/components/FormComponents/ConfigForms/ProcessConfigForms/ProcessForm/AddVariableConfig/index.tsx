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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useContext, useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { FormControl, Typography } from "@material-ui/core";
import { ExpressionEditorProps } from "@wso2-enterprise/ballerina-expression-editor";
import { ADD_VARIABLE, LowcodeEvent, ProcessConfig, SAVE_VARIABLE } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormActionButtons, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { LocalVarDecl, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../../Contexts/Diagram";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../../utils/constants";
import { getAllVariables } from "../../../../../../utils/mixins";
import { createModuleVarDecl, createModuleVarDeclWithoutInitialization, getInitialSource } from "../../../../../../utils/modification-util";
import { getVariableNameFromST, getVarNamePositionFromST } from "../../../../../../utils/st-util";
import { genVariableName } from "../../../../../Portals/utils";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { SelectDropdownWithButton } from "../../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { LowCodeExpressionEditor } from "../../../../FormFieldComponents/LowCodeExpressionEditor";
import { SwitchToggle } from "../../../../FormFieldComponents/SwitchToggle";
import { FormElementProps } from "../../../../Types";
import { VariableNameInput, VariableNameInputProps } from "../../../Components/VariableNameInput";
import {
    VariableTypeInput,
    VariableTypeInputProps
} from "../../../Components/VariableTypeInput";

interface AddVariableConfigProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

// FIXME: remove variableTypes array once its references are removed from other places
export const variableTypes: string[] = ["var", "int", "float", "decimal", "boolean", "string", "json",
    "xml", "error", "any", "anydata", "other"];

export function AddVariableConfig(props: AddVariableConfigProps) {
    const classes = useStyles();
    const intl = useIntl();
    const { config, formArgs, onCancel, onSave, onWizardClose } = props;

    const {
        props: {
            currentFile,
            isMutationProgress: isMutationInProgress,
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
    const formField: string = 'Expression';
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

    const [selectedType, setSelectedType] = useState(initialModelType);
    const [varName, setVarName] = useState(variableName);
    const [variableExpression, setVariableExpression] = useState<string>(varExpression);
    const [initialized, setIsInitialized] = useState<boolean>(initializedState);

    let variableHasReferences = false;

    if (existingProperty && STKindChecker.isLocalVarDecl(config.model)) {
        const symbolRefArray = stSymbolInfo.variableNameReferences.get(variableName);
        variableHasReferences = symbolRefArray ? symbolRefArray.length > 0 : false;
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

    const initialSource = initialized ? (
                getInitialSource(createModuleVarDecl(
                    {
                        varName: varName ? varName : genVariableName("variable", getAllVariables(stSymbolInfo)),
                        varOptions: [],
                        varType: selectedType ? selectedType : "var",
                        varValue: variableExpression ? variableExpression : "EXPRESSION"
                    }
                ))
            ) :
            (
                getInitialSource(createModuleVarDeclWithoutInitialization(
                    {
                        varName: varName ? varName : genVariableName("variable", getAllVariables(stSymbolInfo)),
                        varOptions: [],
                        varType: selectedType ? selectedType : "var",
                        varValue: null
                    }
                ))
            );

    const handleStatementEditorChange = (partialModel: LocalVarDecl) => {
        setSelectedType(partialModel.typedBindingPattern.typeDescriptor.source.trim())
        setVarName(partialModel.typedBindingPattern.bindingPattern.source.trim())
        setVariableExpression(partialModel.initializer?.source.trim())
    }

    const stmtEditorComponent = StatementEditorWrapper(
        {
            label: formTitle,
            initialSource,
            formArgs: { formArgs },
            config,
            onWizardClose,
            onStmtEditorModelChange: handleStatementEditorChange,
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
