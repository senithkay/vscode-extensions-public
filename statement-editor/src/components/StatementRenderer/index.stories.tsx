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

import { StatementEditorContextProvider } from '../../store/statement-editor-context';

import foreachModel from "./data/foreach-st-model.json";
import ifElseBooleanLiteralModel from "./data/ifelse-booleaLiteral-st-model.json";
import ifElseModel from "./data/ifelse-st-model.json";
import varDeclBinaryExpr from "./data/local-var-decl-with-binary-expr-st-model.json";
import panicModel from "./data/panic-st-model.json";
import returnModel from "./data/return-st-model.json";
import varDeclStringLiteral from "./data/varDecl-stringLiteral-model.json";
import whileModel from "./data/while-st-model.json";
import { StatementRenderer, StatementRendererProps } from "./index";

export default {
    title: 'Low Code Editor/Testing/StatementEditor/StatementRenderer',
    component: StatementRenderer,
};

const dummyFunction = (arg: any) => {
};

const dummyFunctionWithoutArgs = () => {
};

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

const statementEditorContextProps = {
    model: varDeclBinaryExpr,
    currentModel: {model: varDeclBinaryExpr},
    onCancelClicked: false,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction,
    validateStatement: dummyFunction,
    getLangClient: () => (Promise.resolve({} as any)),
    applyModifications: () => (Promise.resolve({} as any)),
    currentFile: {
        content: "",
        path: "",
        size: 0
    }
}

const Template: Story<StatementRendererProps> = (args: StatementRendererProps) => (
        <StatementEditorContextProvider {...statementEditorContextProps}>
            <StatementRenderer {...args} />
        </StatementEditorContextProvider>
);

const dummyDiagnosticHandler = () => {
};

export const VarDeclBinaryExprStmt = Template.bind({});

export const VarDeclStringLiteral = Template.bind({});

export const WhileStmt = Template.bind({});

export const ForeachStmt = Template.bind({});

export const IfElseStmt = Template.bind({});

export const IfElseBooleanLiteralStmt = Template.bind({});

export const OtherStmt = Template.bind({});

export const ReturnStmt = Template.bind({});

VarDeclBinaryExprStmt.args = {
    model: varDeclBinaryExpr,
    userInputs: {
        "selectedType": "string",
        "varName": "name",
        "variableExpression": "(expression+expression)",
        "formField": "Expression"
    },
    diagnosticHandler: dummyDiagnosticHandler
};

VarDeclStringLiteral.args = {
    model: varDeclStringLiteral,
    userInputs: {
        "selectedType": "string",
        "varName": "name",
        "variableExpression": "expression",
        "formField": "Expression"
    },
    diagnosticHandler: dummyDiagnosticHandler
};

WhileStmt.args = {
    model: whileModel,
    userInputs: {
        "selectedType": "string",
        "varName": "name",
        "variableExpression": "expression",
        "formField": "Expression"
    },
    diagnosticHandler: dummyDiagnosticHandler
}


ForeachStmt.args = {
    model: foreachModel,
    userInputs: {
        "selectedType": "string",
        "varName": "name",
        "variableExpression": "expression",
        "formField": "Expression"
    },
    diagnosticHandler: dummyDiagnosticHandler
}

IfElseStmt.args = {
    model: ifElseModel,
    userInputs: {
        "selectedType": "boolean",
        "varName": "name",
        "variableExpression": "expression",
        "formField": "Expression"
    },
    diagnosticHandler: dummyDiagnosticHandler
}

IfElseBooleanLiteralStmt.args = {
    model: ifElseBooleanLiteralModel,
    userInputs: {
        "selectedType": "boolean",
        "varName": "name",
        "variableExpression": "expression",
        "formField": "Expression"
    },
    diagnosticHandler: dummyDiagnosticHandler
}

OtherStmt.args = {
    model: panicModel,
    userInputs: {
        "selectedType": "",
        "varName": "",
        "variableExpression": "",
        "formField": "Expression"
    },
    diagnosticHandler: dummyDiagnosticHandler
}

ReturnStmt.args = {
    model: returnModel,
    userInputs: {
        "selectedType": "",
        "varName": "",
        "variableExpression": "",
        "formField": "Expression"
    },
    diagnosticHandler: dummyDiagnosticHandler
}
