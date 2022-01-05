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

import { LibraryInfo, LibrarySearchResponse } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useStatementEditorStyles } from "../../styles";
import { Library } from "../Library";
import { SearchCategory } from "../SearchCategory";

export function SearchResult(props: LibrarySearchResponse) {
    const statementEditorClasses = useStatementEditorStyles();

    return (
        <div className={statementEditorClasses.libraryBlock}>
            <div className={statementEditorClasses.librarySearchSubHeader}>Modules</div>
            {props.modules.map((funcInfo: LibraryInfo, index: number) => (
                <Library name={funcInfo.id} key={index} />
            ))}
            <div className={statementEditorClasses.propertyDivider} />

            {props.classes.length > 0 && <SearchCategory label='Classes' searchResult={props.classes} />}
            {props.functions.length > 0 && <SearchCategory label='Functions' searchResult={props.functions}/>}
            {props.records.length > 0 && <SearchCategory label='Records' searchResult={props.records} />}
            {props.constants.length > 0 && <SearchCategory label='Constants' searchResult={props.constants} />}
            {props.errors.length > 0 && <SearchCategory label='Errors' searchResult={props.errors} />}
            {props.types.length > 0 && <SearchCategory label='Types' searchResult={props.types} />}
            {props.clients.length > 0 && <SearchCategory label='Clients' searchResult={props.clients} />}
            {props.listeners.length > 0 && <SearchCategory label='Listeners' searchResult={props.listeners} />}
            {props.annotations.length > 0 && <SearchCategory label='Annotations' searchResult={props.annotations} />}
            {props.objectTypes.length > 0 && <SearchCategory label='Object Types' searchResult={props.objectTypes} />}
            {props.enums.length > 0 && <SearchCategory label='Enums' searchResult={props.enums} />}
        </div>
    );
}
