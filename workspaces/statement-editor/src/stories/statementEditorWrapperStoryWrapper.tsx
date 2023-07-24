/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect } from 'react';

import { STNode } from "@wso2-enterprise/syntax-tree";

import { StatementEditorWrapper, StatementEditorWrapperProps } from "../components/StatementEditorWrapper";

import { getFileContent, getFileURI, langClientPromise } from './story-utils';

export interface StatementEditorWrapperStoryWrapperProps {
    statement: STNode,
    file: string
}

export function StatementEditorWrapperStoryWrapper(props: StatementEditorWrapperStoryWrapperProps) {
    const {
        statement, file
    } = props;

    const [fileContent, setFileContent ] = React.useState("");

    const fileURI = getFileURI(file)

    useEffect(() => {
      async function openFileInLS() {
          const text = await getFileContent(file);
          setFileContent(text);
      }

      const ignore = openFileInLS();

    }, []);

    return (
      !fileContent ? <>Opening the story component...</>
      :
        <StatementEditorWrapper {...getStatementEditorWrapperProps(statement, fileURI, fileContent)} />
    )
}


function getStatementEditorWrapperProps(statement: STNode, file: string,
                                        fileContent: string): StatementEditorWrapperProps {

    return {
        formArgs: {
            formArgs: {
              targetPosition: statement.position
            }
        },
        applyModifications: (arg: any) => null,
        updateFileContent: (arg: any) => null,
        currentFile: {
            content: fileContent,
            path: file,
            size: 10
        },
        onCancel: () => null,
        config: {
            type: statement.kind,
            model: statement
        },
        onWizardClose: () => null,
        syntaxTree: null,
        stSymbolInfo: null,
        getLangClient: async () =>  {
            const ls = await langClientPromise;
            await ls.onReady();
            return ls;
        },
        library: {
            getLibrariesList: () => Promise.resolve(undefined),
            getLibrariesData: () => Promise.resolve(undefined),
            getLibraryData: () => Promise.resolve(undefined)
        },
        label: statement.kind,
        initialSource: statement.source
    };
}
