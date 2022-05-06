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
import { ModuleProperty } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import classNames from "classnames";

import { useStmtEditorHelperPanelStyles, useStatementEditorStyles } from "../../styles";
import { ModuleElement } from "../ModuleElement";

interface SearchCategoryProps {
    label: string,
    searchResult: ModuleProperty[]
}

export function SearchCategory(props: SearchCategoryProps) {
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const statementEditorClasses = useStatementEditorStyles();
    const { label, searchResult } = props;

    return (
        <div className={stmtEditorHelperClasses.libraryElementBlock}>
            <div
                className={classNames(
                    stmtEditorHelperClasses.librarySearchSubHeader,
                    stmtEditorHelperClasses.libraryElementBlockLabel
                )}
            >
                {label}
            </div>
            <List className={stmtEditorHelperClasses.libraryElementBlockContent}>
                {searchResult.map((property: ModuleProperty, index: number) => (
                    <ModuleElement
                        moduleProperty={property}
                        key={index}
                        isFunction={label === 'Functions'}
                        label={label}
                    />
                ))}
            </List>
            <div className={statementEditorClasses.separatorLine} />
        </div>
    );
}
