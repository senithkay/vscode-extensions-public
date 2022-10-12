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
import React from "react";

import { ListItem, ListItemText, Typography } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import SymbolStructIcon from "../../../../assets/icons/SymbolStructIcon";

const useStyles = makeStyles(() =>
    createStyles({
        menuItem: {
            fontSize: '12px',
            height: '30px',
            cursor: "pointer",
            '&:hover': {
                backgroundColor: '#F0F1FB',
            }
        },
        menuItemText: {
            padding: '5px',
            fontSize: '12px'
        }
    })
);

export interface RecordItemProps {
    recordName: string;
    onClickRecordItem: (recordName: string) => void;
}

export function RecordItem(props: RecordItemProps) {
    const { recordName, onClickRecordItem } = props;
    const classes = useStyles();

    const onClickOnListItem = () => {
        onClickRecordItem(recordName);
    };

    return (
        <>
            <ListItem
                className={classes.menuItem}
                key={recordName}
                value={recordName}
                onClick={onClickOnListItem}
            >
                <SymbolStructIcon />
                <ListItemText
                    primary={<Typography className={classes.menuItemText}>{recordName}</Typography>}
                />
            </ListItem>
        </>
    );
}
