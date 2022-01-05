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
import React from 'react';

import { useStatementEditorStyles } from "../../styles";
import { Function } from "../Function";

interface FunctionInfo {
    id: string,
    description: string,
    moduleId: string
}

interface FunctionsListProps {
    functions: FunctionInfo[]
}

export function FunctionsList(props: FunctionsListProps) {
    const statementEditorClasses = useStatementEditorStyles();

    return (
        <div className={statementEditorClasses.libraryBlock}>
            <div className={statementEditorClasses.librarySearchSubHeader}>Functions</div>
            {props.functions.map((funcInfo: FunctionInfo, index: number) => (
                <Function name={funcInfo.id} moduleId={funcInfo.moduleId} key={index} />
            ))}
            <div className={statementEditorClasses.propertyDivider} />
        </div>
    );
}
