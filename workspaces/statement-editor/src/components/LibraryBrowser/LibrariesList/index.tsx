/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
