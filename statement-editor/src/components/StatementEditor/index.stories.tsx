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
import foreachModel from "../StatementRenderer/data/foreach-st-model.json";
import ifElseBooleanModel from "../StatementRenderer/data/ifelse-booleaLiteral-st-model.json";
import ifElseModel from "../StatementRenderer/data/ifelse-st-model.json";
import varDeclBinaryExprModel from "../StatementRenderer/data/local-var-decl-with-binary-expr-st-model.json";
import panicModel from "../StatementRenderer/data/panic-st-model.json";
import returnModel from "../StatementRenderer/data/return-st-model.json";
import stringModel from "../StatementRenderer/data/varDecl-stringLiteral-model.json";
import whileStmtModel from "../StatementRenderer/data/while-st-model.json";

import { StatementEditor, StatementEditorProps } from "./index";

export default {
    title: 'Low Code Editor/Testing/StatementEditor',
    component: StatementEditor,
};

const dummyFunction = (arg: any) => {
};

const dummyFunctionWithoutArgs = () => {
};

const statementEditorContextProps = {
    model: varDeclBinaryExprModel,
    currentModel: {model: varDeclBinaryExprModel},
    onCancelClicked: false,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction,
    getLangClient: () => (Promise.resolve({} as any)),
    applyModifications: () => (Promise.resolve({} as any)),
    library: {
        getLibrariesList: () => (Promise.resolve({} as any)),
        getLibrariesData: () => (Promise.resolve({} as any)),
        getLibraryData: () => (Promise.resolve({} as any))
    },
    currentFile: {
        content: "",
        path: "",
        size: 0
    },
    importStatements: [''],
    initialSource: ''
}

const Template: Story<StatementEditorProps> = (args: StatementEditorProps) => (
        <StatementEditorContextProvider {...statementEditorContextProps}>
            <StatementEditor {...args} />;
        </StatementEditorContextProvider>
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
