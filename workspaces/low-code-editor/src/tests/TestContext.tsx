/*
* Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein is strictly forbidden, unless permitted by WSO2 in accordance with
* the WSO2 Commercial License available at http://wso2.com/licenses.
* For specific language governing the permissions and limitations under
* this license, please see the license as well as any agreement you’ve
* entered into with WSO2 governing the purchase of this software and any
* associated services.
*/
import React, { FC } from 'react';

import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../Contexts/Diagram";
import { getDiagramProviderProps } from "../DiagramViewManager/utils";
import { LowCodeEditorContext } from "../types";

interface TestProviderProps {
    completeST: STNode;
    focusedST: STNode;
    currentFileContent: string;
    fileUri: string;
    fileName: string;
    langClient: BalleriaLanguageClient
}

export const TestProvider: FC<TestProviderProps> = (props) => {
    const { children, completeST, focusedST, currentFileContent, fileUri, fileName, langClient } = props;
    const { api, ...restProps } = getDiagramProviderProps(
        focusedST,
        "",
        currentFileContent,
        fileUri,
        [{fileName, uri: {fsPath: "", path: fileUri, external: "", sheme: ""}}],
        undefined,
        completeST,
        "",
        "",
        {
            diagramFocus: undefined,
            experimentalEnabled: false,
            filePath: fileUri,
            getAllFiles: jest.fn(),
            getBallerinaVersion: jest.fn(),
            getEnv: jest.fn(),
            getFileContent: jest.fn(),
            getLibrariesData: jest.fn(),
            getLibrariesList: jest.fn(),
            getLibraryData: jest.fn(),
            getPerfDataFromChoreo: jest.fn(),
            getSentryConfig: jest.fn(),
            gotoSource: jest.fn(),
            langClientPromise: Promise.resolve(langClient),
            lastUpdatedAt: "",
            openArchitectureView: jest.fn(),
            openExternalUrl: jest.fn(),
            openInDiagram: undefined,
            projectPaths: [],
            resolveMissingDependency: jest.fn(),
            resolveMissingDependencyByCodeAction: jest.fn(),
            runBackgroundTerminalCommand: jest.fn(),
            runCommand: jest.fn(),
            sendTelemetryEvent: jest.fn(),
            showMessage: jest.fn(),
            showPerformanceGraph: jest.fn(),
            startColumn: 0,
            startLine: 0,
            updateFileContent: jest.fn(),
            workspaceName: ""
        },
        undefined,
        undefined,
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn(),
        jest.fn()
    );
    const contextValue: LowCodeEditorContext = {
        actions: undefined,
        api,
        props: restProps,
        state: undefined
    };

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
}
