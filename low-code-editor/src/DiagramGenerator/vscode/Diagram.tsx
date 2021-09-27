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
    startLine: string;
    lastUpdatedAt: string;
}

export interface EditorAPI {
    getFileContent: (url: string) => Promise<string>;
    updateFileContent: (url: string, content: string) => Promise<boolean>;
}

export type EditorProps = EditorState & EditorAPI;

export const Diagram: React.FC<EditorProps> = (props: EditorProps) => {

    const { getFileContent, updateFileContent, ...restProps } = props;
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
                    panX="-30"
                    panY="0"
                    scale="0.9"
                />
            </DiagramGenErrorBoundary>
        </div>
    );
}
