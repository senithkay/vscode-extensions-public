import * as React from "react";

import { ANALYZE_TYPE, CommandResponse, DiagramEditorLangClientInterface, GetSyntaxTreeResponse, LibraryDataResponse, LibraryDocResponse, LibraryKind, LibrarySearchResponse, LowcodeEvent, PerformanceAnalyzerGraphResponse, PerformanceAnalyzerRealtimeResponse, SentryConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { DiagramGenerator } from "..";
import { DiagramGenErrorBoundary } from "../ErrorBoundrary";

import './style.scss';

export interface EditorState {
    filePath: string;
    langClientPromise: Promise<DiagramEditorLangClientInterface>;
    startColumn: number;
    startLine: number;
    lastUpdatedAt: string;
    experimentalEnabled?: boolean;
}

export interface PFSession {
    choreoAPI: string,
    choreoToken: string | undefined,
    choreoCookie?: string | undefined
}

export interface EditorAPI {
    getFileContent: (url: string) => Promise<string>;
    updateFileContent: (filePath: string, content: string) => Promise<boolean>;
    gotoSource: (filePath: string, position: { startLine: number, startColumn: number }) => Promise<boolean>;
    getPFSession: () => Promise<PFSession>;
    showPerformanceGraph: () => Promise<boolean>;
    getPerfDataFromChoreo: (data: any, analyzeType: ANALYZE_TYPE) => Promise<PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse | undefined>;
    showMessage: () => Promise<boolean>;
    resolveMissingDependency: (filePath: string, fileContent: string) => Promise<GetSyntaxTreeResponse>;
    resolveMissingDependencyByCodeAction: (filePath: string, fileContent: string, diagnostic: any) => Promise<boolean>;
    runCommand: (command: PALETTE_COMMANDS, args: any[]) => Promise<boolean>;
    runBackgroundTerminalCommand?: (command: string) => Promise<CommandResponse>;
    sendTelemetryEvent: (event: LowcodeEvent) => Promise<void>;
    getLibrariesList: (kind?: LibraryKind) => Promise<LibraryDocResponse | undefined>;
    getLibrariesData: () => Promise<LibrarySearchResponse | undefined>;
    getLibraryData: (orgName: string, moduleName: string, version: string) => Promise<LibraryDataResponse | undefined>;
    getSentryConfig: () => Promise<SentryConfig | undefined>;
    getEnv: (name: string) => Promise<any>;
}

export enum PALETTE_COMMANDS {
    RUN = 'ballerina.project.run',
    SWAGGER_VIEW = 'ballerina.swaggerView.open',
    DOCUMENTATION_VIEW = 'ballerina.documentationView.open'
}

export type EditorProps = EditorState & EditorAPI;

export const Diagram: React.FC<EditorProps> = (props: EditorProps) => {

    const { getFileContent, updateFileContent, gotoSource, getPFSession, showPerformanceGraph, getPerfDataFromChoreo,
            sendTelemetryEvent, getSentryConfig,
            showMessage, resolveMissingDependency, resolveMissingDependencyByCodeAction,
            runCommand, runBackgroundTerminalCommand, getLibrariesList, getLibrariesData, getLibraryData, getEnv, ...restProps } = props;
    const [state, setState] = React.useState<EditorState>(restProps);

    React.useEffect(() => {
        setState(restProps);
    }, [restProps.lastUpdatedAt]);

    return (
        <div className="lowcode-main-wrapper">
            <DiagramGenErrorBoundary lastUpdatedAt={restProps.lastUpdatedAt}>
                <DiagramGenerator
                    {...state}
                    getFileContent={getFileContent}
                    updateFileContent={updateFileContent}
                    gotoSource={gotoSource}
                    getPFSession={getPFSession}
                    showPerformanceGraph={showPerformanceGraph}
                    getPerfDataFromChoreo={getPerfDataFromChoreo}
                    showMessage={showMessage}
                    resolveMissingDependency={resolveMissingDependency}
                    resolveMissingDependencyByCodeAction={resolveMissingDependencyByCodeAction}
                    runCommand={runCommand}
                    runBackgroundTerminalCommand={runBackgroundTerminalCommand}
                    sendTelemetryEvent={sendTelemetryEvent}
                    getLibrariesList={getLibrariesList}
                    getLibrariesData={getLibrariesData}
                    getLibraryData={getLibraryData}
                    getSentryConfig={getSentryConfig}
                    getEnv={getEnv}
                    panX="-30"
                    panY="0"
                    scale="0.9"
                />
            </DiagramGenErrorBoundary>
        </div>
    );
}
