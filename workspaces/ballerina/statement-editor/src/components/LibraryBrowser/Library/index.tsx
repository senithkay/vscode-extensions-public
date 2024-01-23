/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext } from 'react';

import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { LibraryDataResponse, LibraryInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { Icon } from "@wso2-enterprise/ui-toolkit";
// import { StatementEditorHint } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { useStmtEditorHelperPanelStyles } from "../../styles";

interface LibraryProps {
    libraryInfo: LibraryInfo,
    key: number,
    libraryBrowsingHandler: (libraryData: LibraryDataResponse) => void
    libraryDataFetchingHandler: (isFetching: boolean, moduleElement?: string) => void
}

export function Library(props: LibraryProps) {
    const { libraryBrowserRpcClient } = useContext(StatementEditorContext);
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const { libraryInfo, key, libraryBrowsingHandler, libraryDataFetchingHandler } = props;
    const { id, orgName, version } = libraryInfo;

    const onClickOnLibrary = async () => {
        libraryDataFetchingHandler(true);
        const response = await libraryBrowserRpcClient.getLibraryData({
            orgName,
            moduleName: id,
            version
        });

        if (response) {
            libraryBrowsingHandler(response);
            libraryDataFetchingHandler(false);
        }
    }

    return (
        <ListItem
            button={true}
            className={stmtEditorHelperClasses.suggestionListItem}
            key={key}
            onClick={onClickOnLibrary}
            disableRipple={true}
        >
            <ListItemIcon style={{ minWidth: 'fit-content', textAlign: 'left', marginRight: '6.25px'}}>
                <Icon name="module-icon" sx={{color: 'var(--vscode-icon-foreground)'}} />
            </ListItemIcon>
            {/* <StatementEditorHint content={id}> */}
                <ListItemText
                    primary={
                        <div className={stmtEditorHelperClasses.suggestionValue}>{id}</div>
                    }
                />
            {/* </StatementEditorHint> */}
        </ListItem>
    );
}
