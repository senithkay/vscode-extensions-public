/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect } from 'react';

import { STNode } from "@wso2-enterprise/syntax-tree";

import { StatementEditor, StatementEditorProps } from '../components/StatementEditor';

import { getFileContent, getFileURI, langClientPromise } from './story-utils';

export interface StatementEditorWrapperProps {
    statement: STNode,
    file: string
}

export function StatementEditorWrapper(props: StatementEditorWrapperProps) {
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

      openFileInLS();

    }, []);

    return (
      !fileContent ? <>Opening the story component...</>
      :
        <StatementEditor {...getStatementEditorProps(statement, fileURI, fileContent)} />
    )
}


function getStatementEditorProps(statement: STNode, file: string, fileContent: string): StatementEditorProps {

  return {
    label: statement.kind,
    initialSource: statement.source,
    formArgs: {
      formArgs: {
        targetPosition: statement.position
      }
    },
    onWizardClose: () => null,
    onCancel: () => null,
    getLangClient: async () =>  {
      const ls = await langClientPromise;
      await ls.onReady();
      return ls;
    },
    applyModifications: (arg: any) => null,
    config: {
      type: statement.kind,
      model: statement
    },
    currentFile: {
      content: fileContent,
      path: file,
      size: 10
    },
    library: {
      getLibrariesList: () => Promise.resolve(undefined),
      getLibrariesData: () => Promise.resolve(undefined),
      getLibraryData: () => Promise.resolve(undefined),
    },
    onStmtEditorModelChange: (arg: any) => null
  }
}
