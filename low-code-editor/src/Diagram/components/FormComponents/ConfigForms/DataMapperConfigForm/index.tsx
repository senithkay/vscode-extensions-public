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
import React, { useContext } from 'react';

import {
    DataMapper
} from "@wso2-enterprise/ballerina-data-mapper";
import {
    FunctionDefinition,
    NodePosition,
    RecordTypeDesc,
    TypeDefinition
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";

export interface DataMapperProps {
    name: string;
    existingModel?: FunctionDefinition;
    model?: RecordTypeDesc | TypeDefinition;
    targetPosition?: NodePosition;
    isTypeDefinition?: boolean;
    onCancel: () => void;
    onSave: (typeDesc: string, recModel: any) => void;
}

export function DataMapperConfigForm(props: DataMapperProps) {
    const { existingModel } = props;

    const {
        props: {
            currentFile
        },
        api: {
            ls: { getExpressionEditorLangClient }
        }
    } = useContext(Context);

    const filePath = `file://${currentFile.path}`;

    const updateFileContentOverride = (fPath: string, newContent: string) => {
        return Promise.resolve(true);
    }

    return (
        <DataMapper
            fnST={existingModel}
            getLangClient={getExpressionEditorLangClient}
            filePath={filePath}
            updateFileContent={updateFileContentOverride}
        />
    );
}
