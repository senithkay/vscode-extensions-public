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

import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import {getPartialSTForStatement, getPartialSTForTopLevelComponents} from "../../utils/ls-utils";
import { FormRenderer } from "../FormRenderer";
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

    const onChange = (genSource: string) => {
    // TODO: Implement
    }

    return (
        <FormRenderer
            type={type}
            model={model}
            targetPosition={targetPosition}
            onChange={onChange}
            onCancel={onCancel}
        />
    )
}
