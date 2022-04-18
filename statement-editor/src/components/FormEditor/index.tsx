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

import { FormControl } from "@material-ui/core";
import { FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { STNode } from "@wso2-enterprise/syntax-tree";
import * as monaco from "monaco-editor";

import { EXPR_SCHEME, FILE_SCHEME } from "../InputEditor/constants";
import { LowCodeEditorProps } from "../StatementEditor";

export interface FormEditorProps extends LowCodeEditorProps {
    initialSource?: string;
    targetPosition?: string;
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
        importStatements
    } = props;

    const [model, setModel] = useState<STNode>(null);

    const fileURI = monaco.Uri.file(currentFile.path).toString().replace(FILE_SCHEME, EXPR_SCHEME);

    useEffect(() => {
        // gg
    }, []);

    useEffect(() => {
        const d = 12;
    }, [model]);

    return (
        <>
            <FormControl data-testid="listener-form" className={formClasses.wizardFormControl}>
                <FormHeaderSection
                    onCancel={onCancel}
                    formTitle={"Function Configuration"}
                    defaultMessage={"Listener"}
                    formType={""}
                />
            </FormControl>
        </>
    )
}
