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
import React from 'react';

import { Toolbar } from '@material-ui/core';
import { FunctionDefinition, NodePosition, STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import { StatementRenderer } from '../components/StatementRenderer';
import { useStatementEditorStyles } from '../components/styles';
import { EditorModel } from "../models/definitions";
import { CtxProviderProps, StatementEditorContextProvider } from '../store/statement-editor-context';
import { visitor  as StatementFindingVisitor} from '../visitors/statement-finding-vistor';

import { langClientPromise } from './story-utils';

export interface StatementRendererWrapperrProps {
    functions: FunctionDefinition[];
}

export function StatementRendererWrapper(props: StatementRendererWrapperrProps) {
    const { functions } = props;
    const statementEditorClasses = useStatementEditorStyles();
    const statementDict:  { [functionName: string]: STNode[]} = {}

    functions.forEach((functionDefintion: FunctionDefinition) => {
      StatementFindingVisitor.setStatementsNull();
      traversNode(functionDefintion, StatementFindingVisitor);
      const statements: STNode[] = StatementFindingVisitor.getStatements();
      statementDict[functionDefintion.functionName.value] = statements;
    })

    return (
        <>
            {Object.entries(statementDict).map(([functionName, statements])  => {
                return(
                  <>
                  <div className={statementEditorClasses.statementExpressionTitle} style={{fontSize: '22px'}}>{functionName}<Toolbar/></div>
                    { statements.map((statement, index) => {
                        return(
                          <div key={index} className={statementEditorClasses.statementExpressionContent} style={{  border: '1px solid #e6e7ec'}} >
                              <StatementEditorContextProvider  {...getStatementEditorContextProps(statement)}>
                                  <StatementRenderer model={statement} />
                              </StatementEditorContextProvider>
                          </div>
                        )
                    })
                    }
                  </>
                )
            })
            }
        </>
    )
}


function getStatementEditorContextProps(statement: any): CtxProviderProps {

    return {
        model: statement,
        currentModel: {
            model: statement
        },
        initialSource: statement.source,
        formArgs: {
            formArgs: statement
        },
        handleChange: (arg: any) => null,
        getLangClient: async () =>  {
            const ls = await langClientPromise;
            await ls.onReady();
            return ls
        },
        applyModifications: (arg: any) => null,
        currentFile: {
            content: "",
            path: "",
            size: 10
        },
        library: {
            getLibrariesList: () => Promise.resolve(undefined),
            getLibrariesData: () => Promise.resolve(undefined),
            getLibraryData: () => Promise.resolve(undefined),
        },
        onCancel: () => null,
        onWizardClose: () => null,
        config: {
            type: statement.kind,
            model: statement
        },
        syntaxTree: null,
        stSymbolInfo: null,
        editorManager: {
            activeEditorId: 0,
            addConfigurable: (newLabel: string, newPosition: NodePosition, newSource: string) => null,
            dropLastEditor: (offset?: number) => null,
            editors: [],
            switchEditor: (index: number) => null,
            updateEditor: (index: number, newContent: EditorModel) => null
        },
        targetPosition: null,
        handleStmtEditorToggle: () => null
    }
}
