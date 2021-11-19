/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js  no-submodule-imports no-empty
import React from 'react';

import { Story } from '@storybook/react/types-6-0';

import { Provider as LowCodeEditorProvider } from "../../../../../../../Contexts/Diagram";
import foreachModel from "../../../../../../FormComponents/FormFieldComponents/StatementEditor/components/StatementRenderer/data/foreach-st-model.json";
import ifElseModel from "../../../../../../FormComponents/FormFieldComponents/StatementEditor/components/StatementRenderer/data/ifelse-st-model.json";
import varDeclBinaryExprModel from "../../../../../../FormComponents/FormFieldComponents/StatementEditor/components/StatementRenderer/data/local-var-decl-with-binary-expr-st-model.json";
import panicModel from "../../../../../../FormComponents/FormFieldComponents/StatementEditor/components/StatementRenderer/data/panic-st-model.json";
import stringModel from "../../../../../../FormComponents/FormFieldComponents/StatementEditor/components/StatementRenderer/data/varDecl-stringLiteral-model.json";
import whileStmtModel from "../../../../../../FormComponents/FormFieldComponents/StatementEditor/components/StatementRenderer/data/while-st-model.json";
import { StatementEditorContextProvider } from '../../store/statement-editor-context';
import ifElseBooleanModel from "../StatementRenderer/data/ifelse-booleaLiteral-st-model.json";
import returnModel from "../StatementRenderer/data/return-st-model.json";

import { ViewContainer, ViewProps } from "./ViewContainer";

export default {
    title: 'Low Code Editor/StatementEditor/ViewContainer',
    component: ViewContainer,
};

const dummyFunction = (arg: any) => {
};

const dummyFunctionWithoutArgs = () => {
};

const statementEditorContextProps = {
    model: varDeclBinaryExprModel,
    onCancelClicked: false,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction,
    validateStatement: dummyFunction
}

const api = {
    tour: { goToNextTourStep: dummyFunction },
    helpPanel: { openConnectorHelp: dummyFunction },
    notifications: {},
    ls: {},
    insights: { trackTriggerSelection: dummyFunction },
    code: {
        modifyDiagram: dummyFunction,
        onMutate: dummyFunction,
        setCodeLocationToHighlight: dummyFunction,
        gotoSource: dummyFunction
    },
    panNZoom: {
        pan: dummyFunction,
        fitToScreen: dummyFunctionWithoutArgs,
        zoomIn: dummyFunctionWithoutArgs,
        zoomOut: dummyFunctionWithoutArgs,
    },
    configPanel: {
        dispactchConfigOverlayForm: dummyFunction,
        closeConfigOverlayForm: dummyFunctionWithoutArgs,
        configOverlayFormPrepareStart: dummyFunctionWithoutArgs,
        closeConfigPanel: dummyFunctionWithoutArgs,
    },
    webView: {
        showSwaggerView: dummyFunction,
    }
}


const props = {
    api,
    currentFile: {
        // @ts-ignore
        type: undefined,
        path: '',
        size: 3,
        content: ''
    },
    // @ts-ignore
    syntaxTree: undefined,
    // @ts-ignore
    originalSyntaxTree: undefined,
    // @ts-ignore
    stSymbolInfo: undefined,
    langServerURL: '',
    // @ts-ignore
    configOverlayFormStatus: undefined,
    // @ts-ignore
    configPanelStatus: undefined,
    isCodeEditorActive: false,
    isPerformanceViewOpen: false,
    isLoadingSuccess: false,
    isWaitingOnWorkspace: false,
    isMutationProgress: false,
    isCodeChangeInProgress: false,
    isReadOnly: false,
    // @ts-ignore
    zoomStatus: undefined
}

const Template: Story<ViewProps> = (args: ViewProps) => (
    <LowCodeEditorProvider {...props} >
        <StatementEditorContextProvider {...statementEditorContextProps}>
            <ViewContainer {...args} />;
        </StatementEditorContextProvider>
    </LowCodeEditorProvider>
);

export const VarDeclBinaryExprStmt = Template.bind({});

export const VarDeclStringLiteralStmt = Template.bind({});

export const WhileStmt = Template.bind({});

export const ForeachStmt = Template.bind({});

export const IfElseStmt = Template.bind({});

export const OtherStmt = Template.bind({});

export const IfElseBooleanLiteralStmt = Template.bind({});

export const ReturnStmt = Template.bind({});

VarDeclBinaryExprStmt.args = {
    kind: "DefaultString",
    label: "Variable Statement",
    formArgs: { model: varDeclBinaryExprModel },
    userInputs: {
        "selectedType": "string",
        "varName": "ga",
        "variableExpression": "(expression+expression)",
        "formField": "Expression"
    },
    validate: dummyFunction,
    isMutationInProgress: false,
    validForm: true,
    onCancel: dummyFunctionWithoutArgs,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction
}

WhileStmt.args = {
    kind: "DefaultBoolean",
    label: "While Statement",
    formArgs: { model: whileStmtModel },
    userInputs: {
        "selectedType": "boolean",
        "varName": "ga",
        "variableExpression": "(expression)",
        "formField": "Expression"
    },
    validate: dummyFunction,
    isMutationInProgress: false,
    validForm: true,
    onCancel: dummyFunctionWithoutArgs,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction
}

ForeachStmt.args = {
    kind: "DefaultString",
    label: "Foreach Statement",
    formArgs: { model: foreachModel },
    userInputs: {
        "selectedType": "var",
        "varName": "item",
        "variableExpression": "expression",
        "formField": "Expression"
    },
    validate: dummyFunction,
    isMutationInProgress: false,
    validForm: true,
    onCancel: dummyFunctionWithoutArgs,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction
}

VarDeclStringLiteralStmt.args = {
    kind: "DefaultString",
    label: "Variable Statement",
    formArgs: { model: stringModel },
    userInputs: {
        "selectedType": "string",
        "varName": "ga",
        "variableExpression": "(expression+expression)",
        "formField": "Expression"
    },
    validate: dummyFunction,
    isMutationInProgress: false,
    validForm: true,
    onCancel: dummyFunctionWithoutArgs,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction
}

IfElseStmt.args = {
    kind: "DefaultBoolean",
    label: "If-Else Statement",
    formArgs: { model: ifElseModel },
    userInputs: {
        "selectedType": "boolean",
        "varName": "ga",
        "variableExpression": "(expression+expression)",
        "formField": "Expression"
    },
    validate: dummyFunction,
    isMutationInProgress: false,
    validForm: true,
    onCancel: dummyFunctionWithoutArgs,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction
}

OtherStmt.args = {
    kind: "NumericLiteral",
    label: "Other Statement",
    formArgs: { model: panicModel},
    userInputs: {
        "selectedType": "",
        "varName": "",
        "variableExpression": "",
        "formField": "Expression"
    },
    validate: dummyFunction,
    isMutationInProgress: false,
    validForm: true,
    onCancel: dummyFunctionWithoutArgs,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction
}

IfElseBooleanLiteralStmt.args = {
    kind: "DefaultBoolean",
    label: "If-Else Statement",
    formArgs: { model: ifElseBooleanModel},
    userInputs: {
        "selectedType": "",
        "varName": "",
        "variableExpression": "",
        "formField": "Expression"
    },
    validate: dummyFunction,
    isMutationInProgress: false,
    validForm: true,
    onCancel: dummyFunctionWithoutArgs,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction
}

ReturnStmt.args = {
    kind: "DefaultReturn",
    label: "Return Statement",
    formArgs: { model: returnModel },
    userInputs: {
        "selectedType": "string",
        "varName": "",
        "variableExpression": "",
        "formField": "Expression"
    },
    validate: dummyFunction,
    isMutationInProgress: false,
    validForm: true,
    onCancel: dummyFunctionWithoutArgs,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction
}
