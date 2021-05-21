/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// tslint:disable-next-line:no-submodule-imports
import { DiagramEditorLangClientInterface } from "@wso2-enterprise/low-code-editor";
// tslint:disable-next-line:no-submodule-imports
import { DiagramGenErrorBoundary } from "@wso2-enterprise/low-code-editor/build/DiagramGenerator/ErrorBoundrary/index";
// tslint:disable-next-line:no-submodule-imports
import { DiagramGenerator } from "@wso2-enterprise/low-code-editor/build/DiagramGenerator/index";
import * as React from "react";
import { Header } from "semantic-ui-react";

export interface DiagramProps {
    target: HTMLElement;
    editorProps: {
        langClient: DiagramEditorLangClientInterface,
        filePath: string,
        startLine: number,
        startColumn: number,
        kind: string,
        name: string
    };
}

export interface DiagramStates {
    filePath: string;
    kind: string;
    langClient: DiagramEditorLangClientInterface;
    name: string;
    startColumn: number;
    startLine: number;
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
                <Header className="header-wrapper">
                    {this.state.kind}: {this.state.name}
                </Header>
                <DiagramGenErrorBoundary>
                    <DiagramGenerator diagramLangClient={this.languageClient} filePath={this.state.filePath}
                        startLine={this.state.startLine.toString()} updated={this.updated}
                        startCharacter={this.state.startColumn.toString()} />
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
