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

import { ExpressionEditorLangClientInterface, STModification } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { STSymbolInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import * as monaco from "monaco-editor";

import { enrichModel, getUpdatedSource} from "../../utils";
import {
    getPartialSTForModuleMembers,
    handleDiagnostics,
    sendDidChange
} from "../../utils/ls-utils";
import { FormRenderer } from "../FormRenderer";
import { getInitialSource } from "../Forms/Utils/FormUtils";
import { EXPR_SCHEME, FILE_SCHEME } from "../InputEditor/constants";

export interface FormEditorProps {
    initialSource?: string;
    initialModel?: STNode;
    currentFile: {
        content: string,
        path: string,
        size: number
    };
    targetPosition: NodePosition;
    stSymbolInfo?: STSymbolInfo;
    type: string;
    onCancel: () => void;
    applyModifications: (modifications: STModification[]) => void;
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
    topLevelComponent?: boolean;
}

export function FormEditor(props: FormEditorProps) {
    const {
        initialSource,
        initialModel,
        onCancel,
        getLangClient,
        applyModifications,
        currentFile,
        type,
        targetPosition,
        topLevelComponent,
        stSymbolInfo
    } = props;

    const [model, setModel] = useState<STNode>(null);

    const fileURI = monaco.Uri.file(currentFile.path).toString().replace(FILE_SCHEME, EXPR_SCHEME);

    const onChange = async (genSource: string, partialST: STNode, moduleList: Set<string>) => {
        const newModuleList = new Set<string>();
        moduleList.forEach(module => {
            if (!currentFile.content.includes(module)){
                newModuleList.add(module);
            }
        })
        const updatedContent = await getUpdatedSource(genSource.trim(), currentFile.content, initialModel ?
                initialModel.position : {...targetPosition, endLine: targetPosition.startLine, startColumn: 0,
                                         endColumn: 0}, newModuleList, true);
        sendDidChange(fileURI, updatedContent, getLangClient).then();
        const diagnostics = await handleDiagnostics(genSource, fileURI, targetPosition, getLangClient).then();
        setModel(enrichModel(partialST, initialModel ?
            initialModel.position : {...targetPosition, endLine: targetPosition.startLine, startColumn: 0,
                                     endColumn: 0}, diagnostics));
    };

    useEffect(() => {
        if (initialSource) {
            (async () => {
                if (topLevelComponent) {
                    const partialST = await getPartialSTForModuleMembers(
                        { codeSnippet: initialSource.trim() }, getLangClient
                    );
                    setModel(partialST);
                }
            })();
        } else {
            (async () => {
                if (topLevelComponent) {
                    const partialST = await getPartialSTForModuleMembers(
                        {codeSnippet: getInitialSource(type, targetPosition)}, getLangClient
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
                stSymbolInfo={stSymbolInfo}
                onChange={onChange}
                onCancel={onCancel}
                getLangClient={getLangClient}
                isEdit={initialSource !== undefined}
                applyModifications={applyModifications}
            />
        </div>
    )
}
