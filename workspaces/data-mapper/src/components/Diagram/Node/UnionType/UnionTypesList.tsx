/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { List } from "@material-ui/core";

import { useStyles } from "./style";
import { UnionTypeListItem } from "./UnionTypeListItem";

export interface UnionTypesListProps {
    unionTypes: string[];
    onClickType: (type: string) => void;
}

export function UnionTypesList(props: UnionTypesListProps) {
    const { unionTypes, onClickType } = props;
    const classes = useStyles();

    return (
        <>
            <List className={classes.unionTypesList} data-testid="suggestion-list">
                {
                    unionTypes.map((type: string, index: number) => (
                        <UnionTypeListItem
                            key={index}
                            type={type}
                            onClickType={onClickType}
                        />
                    ))
                }
            </List>
        </>
    );
}
