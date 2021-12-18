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
import {Story} from '@storybook/react/types-6-0';

import { Provider as LowCodeEditorProvider } from "../../../../../../../Contexts/Diagram";

import {AddWhileForm, WhileProps } from "./index";


export default {
    title: 'Low Code Editor/Diagram/Statements/While',
    component: AddWhileForm,
};

// tslint:disable-next-line:no-empty
const dummyFunction = (arg: any) => {} ;
// tslint:disable-next-line:no-empty
const dummyFunctionWithoutArgs =  () => {};

const api = {
    tour: { goToNextTourStep: dummyFunction },
    helpPanel: {openConnectorHelp: dummyFunction},
    notifications: {},
    ls: {},
    insights: { trackTriggerSelection: dummyFunction},
    code: {
        modifyDiagram: dummyFunction,
        onMutate: dummyFunction,
        modifyTrigger: dummyFunction,
        setCodeLocationToHighlight: dummyFunction,
        gotoSource: dummyFunction,
        isMutationInProgress: false
    },
    splitPanel: {
        maximize: dummyFunction,
        minimize: dummyFunction,
        setPrimaryRatio: dummyFunction,
        setSecondaryRatio: dummyFunction,
        handleRightPanelContent: dummyFunction
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
    },
    project: {
        run: dummyFunction
    }
}


export const mockedEditorProps = {
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

const Template: Story<WhileProps> = (args: WhileProps) => {
    return(
        <LowCodeEditorProvider {...mockedEditorProps} >
            <AddWhileForm {...args}/>
        </LowCodeEditorProvider>
    );
}

export const While = Template.bind({});
While.args = {
    condition: {
        type: ''
    }
};
