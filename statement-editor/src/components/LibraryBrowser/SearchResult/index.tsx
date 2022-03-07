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

import { List } from "@material-ui/core";
import {
    LibraryDataResponse,
    LibraryInfo,
    LibrarySearchResponse
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useStatementEditorStyles } from "../../styles";
import { Library } from "../Library";
import { SearchCategory } from "../SearchCategory";

interface SearchResultProps {
    librarySearchResponse: LibrarySearchResponse,
    libraryBrowsingHandler?: (libraryData: LibraryDataResponse) => void
    moduleSelected: boolean
}

export function SearchResult(props: SearchResultProps) {
    const statementEditorClasses = useStatementEditorStyles();
    const { librarySearchResponse, libraryBrowsingHandler, moduleSelected } = props;
    const { modules, classes, functions, records, constants, errors, types, clients, listeners, annotations,
            objectTypes, enums } = librarySearchResponse;

    return (
        <>
            {modules.length > 0 && !moduleSelected && (
                    <div>
                        <div className={statementEditorClasses.librarySearchSubHeader}>Modules</div>
                        <List className={statementEditorClasses.libraryListBlock} style={{paddingBottom: '25px'}}>
                            {modules.map((library: LibraryInfo, index: number) => (
                                <Library libraryInfo={library} key={index} libraryBrowsingHandler={libraryBrowsingHandler}/>
                            ))}
                        </List>
                    </div>
                )
            }

            {classes.length > 0 && <SearchCategory label='Classes' searchResult={classes} />}
            {functions.length > 0 && <SearchCategory label='Functions' searchResult={functions}/>}
            {records.length > 0 && <SearchCategory label='Records' searchResult={records} />}
            {constants.length > 0 && <SearchCategory label='Constants' searchResult={constants} />}
            {errors.length > 0 && <SearchCategory label='Errors' searchResult={errors} />}
            {types.length > 0 && <SearchCategory label='Types' searchResult={types} />}
            {clients.length > 0 && <SearchCategory label='Clients' searchResult={clients} />}
            {listeners.length > 0 && <SearchCategory label='Listeners' searchResult={listeners} />}
            {annotations.length > 0 && <SearchCategory label='Annotations' searchResult={annotations} />}
            {objectTypes.length > 0 && <SearchCategory label='Object Types' searchResult={objectTypes} />}
            {enums.length > 0 && <SearchCategory label='Enums' searchResult={enums} />}
        </>
    );
}
