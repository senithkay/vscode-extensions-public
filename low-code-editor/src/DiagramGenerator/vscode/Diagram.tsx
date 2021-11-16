import * as React from "react";

import { makeStyles, Theme, withStyles } from "@material-ui/core";

import { DiagramGenerator } from "..";
import { DotBackground } from "../../assets";
import { DiagramEditorLangClientInterface } from "../../Definitions/diagram-editor-lang-client-interface";
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
    showMessage: () => Promise<boolean>;
    resolveMissingDependency: (filePath: string, fileContent: string) => Promise<boolean>;
    createSwaggerView: (documentFilePath: string, serviceName: string) => Promise<boolean>;
}

export type EditorProps = EditorState & EditorAPI;

export const Diagram: React.FC<EditorProps> = (props: EditorProps) => {

    const { getFileContent, updateFileContent, gotoSource, getPFSession,
            showPerformanceGraph, showMessage, resolveMissingDependency, createSwaggerView, ...restProps } = props;
    const [state, setState] = React.useState<EditorState>(restProps);

    React.useEffect(() => {
        setState(restProps);
    }, [restProps.lastUpdatedAt]);

    return (
        <div className="lowcode-main-wrapper">
            <DiagramGenErrorBoundary>
                <DiagramGenerator
                    {...state}
                    getFileContent={getFileContent}
                    updateFileContent={updateFileContent}
                    gotoSource={gotoSource}
                    getPFSession={getPFSession}
                    showPerformanceGraph={showPerformanceGraph}
                    showMessage={showMessage}
                    resolveMissingDependency={resolveMissingDependency}
                    createSwaggerView={createSwaggerView}
                    panX="-30"
                    panY="0"
                    scale="0.9"
                />
            </DiagramGenErrorBoundary>
        </div>
    );
}
