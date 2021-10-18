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
import React from 'react';

// tslint:disable-next-line: no-submodule-imports
import { Story } from '@storybook/react/types-6-0';

import stModel from "./data/st-model-raw.json"

import { ExpressionComponent, ExpressionComponentProps } from "./index";
import { Provider as LowCodeEditorProvider } from "../../../../../../../../Contexts/Diagram";
import { InputEditorContextProvider } from "../../store/input-editor-context";
import { ConnectionDetails } from "../../../../../../../../api/models";
import { StatementEditorContextProvider } from "../../store/statement-editor-context";

export default {
    title: 'Low Code Editor/StatementEditor/StatementRenderer',
    component: ExpressionComponent,
};

// tslint:disable-next-line:no-empty
const dummyFunction = (arg: any) => {
};
// tslint:disable-next-line:no-empty
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
        modifyTrigger: dummyFunction,
        setCodeLocationToHighlight: dummyFunction
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
        // tslint:disable-next-line:no-empty
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

const fileType: "File" | "Folder" = "File";
const initialContext = {
    diagnostics: [] as any,
    targetPosition: {
        endColumn: 22,
        endLine: 10,
        startColumn: 4,
        startLine: 10,
    },
    currentFile: {
        type: fileType,
        path: "",
        size: 1,
        content: "CnB1YmxpYyBmdW5jdGlvbiBtYWluKCkgcmV0dXJucyBlcnJvcj8gewoKfQo="

    },
    langServerURL: '',
    syntaxTree: stModel,
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

const statementEditorContextProps = {
    model: stModel,
    onCancelClicked: false,
    onSave: dummyFunctionWithoutArgs,
    onChange: dummyFunction,
    validate: dummyFunction
}

const Template: Story<ExpressionComponentProps> = (args: ExpressionComponentProps) =>
    // <LowCodeEditorProvider currentApp={undefined} api={undefined} currentAppType={'Schedule'} originalSyntaxTree={undefined}
    //           stSymbolInfo={undefined}
    //           configOverlayFormStatus={undefined} configPanelStatus={undefined} isCodeEditorActive={false}
    //           isPerformanceViewOpen={false} isLoadingSuccess={false} isWaitingOnWorkspace={false}
    //           isMutationProgress={false} isCodeChangeInProgress={false} isReadOnly={false}
    //           zoomStatus={undefined} {...initialContext} >
    <LowCodeEditorProvider {...props} >
        <StatementEditorContextProvider {...statementEditorContextProps}>
            <InputEditorContextProvider {...inputEditorContextProps}>

                <ExpressionComponent {...args} />

            </InputEditorContextProvider>
        </StatementEditorContextProvider>
    </LowCodeEditorProvider>;


const dummyDiagnosticHandler = () => {
};
export const StmtRendererComponent = Template.bind({});
StmtRendererComponent.args = {
    model: stModel,
    isRoot: true,
    userInputs: {
        "selectedType": "string",
        "varName": "ga",
        "variableExpression": "(expression+expression)",
        "formField": "Expression"
    },
    diagnosticHandler: dummyDiagnosticHandler
};
