import * as React from "react";

import { DiagramEditorLangClientInterface, PerformanceAnalyzerGraphResponse, PerformanceAnalyzerRealtimeResponse } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { DiagramGenerator } from "..";
import { DiagramGenErrorBoundary } from "../ErrorBoundrary";

import './style.scss';

export interface EditorState {
    filePath: string;
    langClient: DiagramEditorLangClientInterface;
    startColumn: number;
    startLine: number;
    lastUpdatedAt: string;
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
    handlePerfErrors: (response: PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse) => Promise<boolean>;
    showMessage: () => Promise<boolean>;
    resolveMissingDependency: (filePath: string, fileContent: string) => Promise<boolean>;
    resolveMissingDependencyByCodeAction: (filePath: string, fileContent: string, diagnostic: any) => Promise<boolean>;
    runCommand: (command: PALETTE_COMMANDS, args: any[]) => Promise<boolean>;
}

export enum PALETTE_COMMANDS {
    RUN = 'ballerina.project.run',
    SWAGGER_VIEW = 'ballerina.swaggerView.open',
    DOCUMENTATION_VIEW = 'ballerina.documentationView.open'
}

export type EditorProps = EditorState & EditorAPI;

export const Diagram: React.FC<EditorProps> = (props: EditorProps) => {

    const { getFileContent, updateFileContent, gotoSource, getPFSession,
            showPerformanceGraph, handlePerfErrors, showMessage, resolveMissingDependency, resolveMissingDependencyByCodeAction, runCommand, ...restProps } = props;
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
                    handlePerfErrors={handlePerfErrors}
                    showMessage={showMessage}
                    resolveMissingDependency={resolveMissingDependency}
                    resolveMissingDependencyByCodeAction={resolveMissingDependencyByCodeAction}
                    runCommand={runCommand}
                    panX="-30"
                    panY="0"
                    scale="0.9"
                />
            </DiagramGenErrorBoundary>
        </div>
    );
}
