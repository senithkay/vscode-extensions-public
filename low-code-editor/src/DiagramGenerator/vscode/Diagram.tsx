import * as React from "react";

import { DiagramGenerator } from "..";
import { DiagramEditorLangClientInterface } from "../../Definitions/diagram-editor-lang-client-interface";
import { DiagramGenErrorBoundary } from "../ErrorBoundrary";

export interface DiagramProps {
    target: HTMLElement;
    editorProps: DiagramStates;
}

export interface DiagramStates {
    filePath: string;
    kind: string;
    langClient: DiagramEditorLangClientInterface;
    name: string;
    startColumn: number;
    startLine: number;
    getFileContent?: (url: string) => Promise<string>;
    updateFileContent?: (url: string, content: string) => Promise<boolean>;
}

/**
 * React component for rendering a the low code editor.
 */
export class Diagram extends React.Component<DiagramProps, DiagramStates> {

    private languageClient: DiagramEditorLangClientInterface;
    private updated: boolean;

    constructor(props: DiagramProps) {
        super(props);
        this.languageClient = props.editorProps.langClient;
        this.updated = false;
        this.state = {
            filePath: props.editorProps.filePath,
            kind: props.editorProps.kind,
            langClient: props.editorProps.langClient,
            name: props.editorProps.name,
            startColumn: props.editorProps.startColumn,
            startLine: props.editorProps.startLine
        };
    }

    public render() {
        return (
            <div className="low-code-container">
                <DiagramGenErrorBoundary>
                    <DiagramGenerator
                        diagramLangClient={this.languageClient}
                        filePath={this.state.filePath}
                        startLine={this.state.startLine.toString()}
                        updated={this.updated}
                        startCharacter={this.state.startColumn.toString()}
                        getFileContent={this.props.editorProps.getFileContent}
                        updateFileContent={this.props.editorProps.updateFileContent}
                        panX="-30"
                        panY="0"
                        scale="0.9"
                    />
                </DiagramGenErrorBoundary>
            </div>
        );
    }

    public update(properties: {
        filePath: string,
        startLine: number,
        startColumn: number,
        kind: string,
        name: string,
        langClient: DiagramEditorLangClientInterface
    }) {
        this.updated = !this.updated;
        this.setState({
            filePath: properties.filePath,
            kind: properties.kind,
            langClient: properties.langClient,
            name: properties.name,
            startColumn: properties.startColumn,
            startLine: properties.startLine
        });
    }
}
