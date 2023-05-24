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
import { BalleriaLanguageClient } from "@wso2-enterprise/ballerina-languageclient";

import { EditorProps } from "../../DiagramGenerator/vscode/Diagram";

export function getEditorProps(fileUri: string, langClient: BalleriaLanguageClient): EditorProps {
    return {
        diagramFocus: undefined,
        experimentalEnabled: false,
        filePath: fileUri,
        getAllFiles: jest.fn(),
        getBallerinaVersion: () => Promise.resolve(process.env.BAL_VERSION || "2201.6.0"),
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
    };
}
