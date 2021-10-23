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

import { ConnectionDetails } from "../../../../../../../../api/models";
import { Provider as LowCodeEditorProvider } from "../../../../../../../../Contexts/Diagram";
import { InputEditorContextProvider } from "../../store/input-editor-context";
import { StatementEditorContextProvider } from "../../store/statement-editor-context";
import foreachModel from "../StatementRenderer/data/foreach-st-model.json";
import ifElseModel from "../StatementRenderer/data/ifelse-st-model.json";
import panicModel from "../StatementRenderer/data/panic-st-model.json";
import stModel from "../StatementRenderer/data/st-model-raw.json";
import stringModel from "../StatementRenderer/data/varDecl-stringLiteral-model.json";
import whileStmtModel from "../StatementRenderer/data/while-st-model.json";

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
    model: stModel,
    onCancelClicked: false,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction,
    validate: dummyFunction
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
        modifyTrigger: dummyFunction,
        setCodeLocationToHighlight: dummyFunction,
        gotoSource: dummyFunction
    },
    connections: {
        getAllConnections: async (orgHandle: string): Promise<ConnectionDetails[]> => {
            const completions: ConnectionDetails[] = [];
            return completions;
        }
    },
    ai: {},
    splitPanel: {
        maximize: dummyFunction,
        minimize: dummyFunction,
        setPrimaryRatio: dummyFunction,
        setSecondaryRatio: dummyFunction,
        handleRightPanelContent: dummyFunction
    },
    data: {
        getGsheetList: async (): Promise<any> => ([]),
    },
    oauth: {
        dispatchGetAllConfiguration: async (): Promise<void> => {
        },
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
    }
}


const props = {
    api,
    // @ts-ignore
    currentAppType: undefined,
    currentApp: {
        workingFile: "/apps/username/apName/project/choreo.bal",
        id: 1,
        name: '',
        displayName: '',
        org: '',
        organizationId: 0,
        // @ts-ignore
        template: undefined,
        createdAt: ''
    },
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

const inputEditorContextProps: any = {
    userInputs: {
        "selectedType": "string",
        "varName": "ga",
        "variableExpression": "(expression+expression)",
        "formField": "Expression"
    },
    onVariableSelection: (value: string) => {
    }
}

const Template: Story<ViewProps> = (args: ViewProps) => (
    <LowCodeEditorProvider {...props} >
        <StatementEditorContextProvider {...statementEditorContextProps}>
            <InputEditorContextProvider {...inputEditorContextProps}>
                <ViewContainer {...args} />;
            </InputEditorContextProvider>
        </StatementEditorContextProvider>
    </LowCodeEditorProvider>
);

export const ViewContainerDefault = Template.bind({});

export const ViewContainerVarDeclString = Template.bind({});

export const ViewContainerWhileStmt = Template.bind({});

export const ViewContainerForeachStmt = Template.bind({});

export const ViewContainerIfElseStmt = Template.bind({});

export const ViewContainerOtherStmt = Template.bind({});



ViewContainerDefault.args = {
    kind: "DefaultString",
    label: "Variable Statement",
    formArgs: { model: stModel },
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

ViewContainerWhileStmt.args = {
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

ViewContainerForeachStmt.args = {
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

ViewContainerVarDeclString.args = {
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

ViewContainerIfElseStmt.args = {
    kind: "DefaultBoolean",
    label: "If-else Statement",
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

ViewContainerOtherStmt.args = {
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
