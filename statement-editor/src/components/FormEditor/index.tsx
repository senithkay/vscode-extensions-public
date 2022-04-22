/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useEffect, useState } from 'react';

import { List, ListItemText, Typography } from "@material-ui/core";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import * as monaco from "monaco-editor";
import { Diagnostic } from "vscode-languageserver-protocol";

import { StmtDiagnostic } from "../../models/definitions";
import { getFilteredDiagnosticMessages, getUpdatedSource} from "../../utils";
import { getDiagnostics, getPartialSTForTopLevelComponents, sendDidChange } from "../../utils/ls-utils";
import { FormRenderer } from "../FormRenderer";
import { EXPR_SCHEME, FILE_SCHEME } from "../InputEditor/constants";
import { LowCodeEditorProps } from "../StatementEditor";

export interface FormEditorProps extends LowCodeEditorProps {
    initialSource?: string;
    targetPosition: NodePosition;
    type: string;
    onCancel: () => void;
}

export function FormEditor(props: FormEditorProps) {
    const {
        initialSource,
        onCancel,
        getLangClient,
        applyModifications,
        library,
        currentFile,
        importStatements,
        type,
        targetPosition,
        topLevelComponent
    } = props;

    const [model, setModel] = useState<STNode>(null);
    const [stmtDiagnostics, setStmtDiagnostics] = useState<StmtDiagnostic[]>(null);

    const fileURI = monaco.Uri.file(currentFile.path).toString().replace(FILE_SCHEME, EXPR_SCHEME);

    const handleDiagnostics = async (source: string): Promise<Diagnostic[]> => {
        const diagResp = await getDiagnostics(fileURI, getLangClient);
        const diag  = diagResp[0]?.diagnostics ? diagResp[0].diagnostics : [];
        const messages = getFilteredDiagnosticMessages(source, targetPosition, diag);
        setStmtDiagnostics(messages);
        return diag;
    };

    const onChange = async (genSource: string) => {
        const updatedContent = await getUpdatedSource(genSource, currentFile.content, targetPosition,
            undefined, true);
        sendDidChange(fileURI, updatedContent, getLangClient).then();
        handleDiagnostics(genSource).then();
    };

    useEffect(() => {
        if (initialSource) {
            (async () => {
                if (topLevelComponent) {
                    const partialST = await getPartialSTForTopLevelComponents(
                        { codeSnippet: initialSource.trim() }, getLangClient
                    );
                    setModel(partialST);
                }
            })();
        }
    }, [initialSource]);

    return (
        <div>
            <FormRenderer
                type={type}
                model={model}
                targetPosition={targetPosition}
                onChange={onChange}
                onCancel={onCancel}
                getLangClient={getLangClient}
                applyModifications={applyModifications}
            />
            <List>
                {
                    stmtDiagnostics && stmtDiagnostics.map((diag: StmtDiagnostic, index: number) => (
                        !diag.isPlaceHolderDiag && (
                            <ListItemText
                                key={index}
                                primary={(
                                    <Typography>{diag.message}</Typography>
                                )}
                            />
                        )
                    ))
                }
            </List>
        </div>
    )
}
