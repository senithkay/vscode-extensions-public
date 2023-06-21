/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

import {
    ExpressionEditorLangClientInterface,
    STModification,
    STSymbolInfo
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { SuggestionItem } from "../../models/definitions";
import { getFormComponent } from "../../utils";

export interface FormRendererProps {
    type: string;
    model: STNode;
    completions: SuggestionItem[];
    syntaxTree?: STNode;
    targetPosition: NodePosition;
    isEdit: boolean;
    currentFile: {
        content: string,
        path: string,
        size: number
    };
    stSymbolInfo?: STSymbolInfo;
    onChange: (code: string, partialST: STNode, moduleList?: Set<string>) => void;
    onCancel: () => void;
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
    applyModifications: (modifications: STModification[]) => void;
    changeInProgress: boolean;
}

export function FormRenderer(props: FormRendererProps) {
    const { type, model, completions } = props;

    const component = getFormComponent(type, model, completions);

    return (
        <>
            {component}
        </>
    );
}
