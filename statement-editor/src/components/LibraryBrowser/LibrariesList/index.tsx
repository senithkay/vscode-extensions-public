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
import { Library } from '../Library';

interface LibraryInfo {
    id: string,
    summary: string
}

interface LibrariesListProps {
    libraries: LibraryInfo[]
}

export function LibrariesList(props: LibrariesListProps) {
    const statementEditorClasses = useStatementEditorStyles();

    return (
        <div className={statementEditorClasses.libraryBlock}>
            <ul>
                {props.libraries.map((library: LibraryInfo, index: number) => (
                    <Library name={library.id} key={index} />
                ))}
            </ul>
        </div>
    );
}
