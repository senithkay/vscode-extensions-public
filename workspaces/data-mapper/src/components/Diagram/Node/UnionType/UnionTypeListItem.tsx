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
import { VscSymbolStructure } from "react-icons/vsc";

import { ListItem, ListItemText, Typography } from "@material-ui/core";
import { StatementEditorHint } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { useStyles } from "./style";

export interface UnionTypeListItemProps {
    key: number;
    type: string;
    onClickType: (type: string) => void;
}

export function UnionTypeListItem(props: UnionTypeListItemProps) {
    const { key, type, onClickType } = props;
    const classes = useStyles();

    const onClickOnListItem = () => {
        onClickType(type);
    };

    return (
        <StatementEditorHint
            content={type}
            contentType={null}
        >
            <ListItem
                button={true}
                key={key}
                onMouseDown={onClickOnListItem}
                className={classes.unionTypeListItem}
                disableRipple={true}
            >
                <VscSymbolStructure
                    style={{ minWidth: '22px', textAlign: 'left', color: '#000' }}
                />
                <ListItemText
                    data-testid="suggestion-value"
                    style={{ flex: 'none', maxWidth: '80%' }}
                    primary={(
                        <Typography className={classes.unionTypeValue}>
                            {type}
                        </Typography>
                    )}
                />
            </ListItem>
        </StatementEditorHint>
    );
}
