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
import { jest } from "@jest/globals";
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";

import { EditorProps } from "../../DiagramGenerator/vscode/Diagram";

export function getEditorProps(fileUri: string, langClient: BalleriaLanguageClient): EditorProps {
    return {
        diagramFocus: undefined,
        experimentalEnabled: false,
        filePath: fileUri,
        langClientPromise: Promise.resolve(langClient),
        lastUpdatedAt: "",
        projectPaths: [],
        startColumn: 0,
        startLine: 0,
        workspaceName: "",
        openInDiagram: undefined,
        getAllFiles: jest.fn(() => Promise.resolve([])),
        getBallerinaVersion: jest.fn(() => Promise.resolve(undefined)),
        getEnv: jest.fn(() => Promise.resolve()),
        getFileContent: jest.fn(() => Promise.resolve("")),
        getLibrariesData: jest.fn(() => Promise.resolve(undefined)),
        getLibrariesList: jest.fn(() => Promise.resolve(undefined)),
        getLibraryData: jest.fn(() => Promise.resolve(undefined)),
        getPerfDataFromChoreo: jest.fn(() => Promise.resolve(undefined)),
        getSentryConfig: jest.fn(() => Promise.resolve(undefined)),
        gotoSource: jest.fn(() => Promise.resolve(false)),
        openArchitectureView: jest.fn(() => Promise.resolve(false)),
        openExternalUrl: jest.fn(() => Promise.resolve(false)),
        renameSymbol: jest.fn(() => Promise.resolve(false)),
        resolveMissingDependency: jest.fn(() => Promise.resolve(undefined)),
        resolveMissingDependencyByCodeAction: jest.fn(() => Promise.resolve(false)),
        runBackgroundTerminalCommand: jest.fn(() => Promise.resolve(undefined)),
        runCommand: jest.fn(() => Promise.resolve(false)),
        sendTelemetryEvent: jest.fn(() => Promise.resolve(undefined)),
        showMessage: jest.fn(() => Promise.resolve(false)),
        showPerformanceGraph: jest.fn(() => Promise.resolve(false)),
        updateFileContent: jest.fn(() => Promise.resolve(false)),
    };
}
