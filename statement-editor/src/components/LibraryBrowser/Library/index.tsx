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

import React, { useContext } from 'react';

import { ListItem, ListItemText } from "@material-ui/core";
import { LibraryDataResponse, LibraryInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { useStatementEditorStyles } from "../../styles";

interface LibraryProps {
    libraryInfo: LibraryInfo,
    key: number,
    libraryBrowsingHandler: (libraryData: LibraryDataResponse) => void
}

export function Library(props: LibraryProps) {
    const stmtCtx = useContext(StatementEditorContext);
    const {
        library: {
            getLibraryData
        }
    } = stmtCtx;
    const statementEditorClasses = useStatementEditorStyles();
    const { libraryInfo, key, libraryBrowsingHandler } = props;
    const { id, orgName, version } = libraryInfo;

    const onClickOnLibrary = async () => {
        const response = await getLibraryData(orgName, id, version);

        if (response) {
            libraryBrowsingHandler(response);
        }
    }

    return (
        <ListItem
            button={true}
            className={statementEditorClasses.suggestionListItem}
            key={key}
            onClick={onClickOnLibrary}
            disableRipple={true}
        >
            <ListItemText
                primary={id}
            />
        </ListItem>
    );
}
