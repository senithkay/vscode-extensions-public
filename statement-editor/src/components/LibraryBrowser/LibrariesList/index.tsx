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
import { LibraryDataResponse, LibraryInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useStmtEditorHelperPanelStyles } from "../../styles";
import { Library } from '../Library';

interface LibrariesListProps {
    libraries: LibraryInfo[],
    libraryBrowsingHandler: (libraryData: LibraryDataResponse) => void
    libraryDataFetchingHandler: (isFetching: boolean) => void
}

export function LibrariesList(props: LibrariesListProps) {
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const { libraries, libraryBrowsingHandler, libraryDataFetchingHandler } = props;

    return (
        <List className={stmtEditorHelperClasses.libraryListBlock} data-testid="library-list-block">
            {libraries.map((library: LibraryInfo, index: number) => (
                <Library
                    libraryInfo={library}
                    key={index}
                    libraryBrowsingHandler={libraryBrowsingHandler}
                    libraryDataFetchingHandler={libraryDataFetchingHandler}
                />
            ))}
        </List>
    );
}
