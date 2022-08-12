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

import { IconButton } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";

import CollapseIcon from "../../../../assets/icons/CollapseIcon";
import { ViewOption } from "../../../DataMapper/DataMapper";

import { ExpandedMappingHeaderNode } from "./ExpandedMappingHeaderNode";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: '100%',
            minWidth: 400,
            backgroundColor: "#fff",
            padding: "5px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            color: "#74828F"
        },
        fromClause: {
            padding: "5px",
            fontFamily: "monospace"
        },
        header: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
        },
        icons: {
            padding: '8px',
            '&:hover': {
                backgroundColor: '#F0F1FB',
            }
        },
        collapseIcon: {
            height: '15px',
            width: '15px',
            marginTop: '-7px',
            marginLeft: '-7px'
        },
        buttonWrapper: {
            border: '1px solid #e6e7ec',
            borderRadius: '8px',
            position: "absolute",
            right: "35px"
        }
    })
);

export interface ExpandedMappingHeaderWidgetProps {
    node: ExpandedMappingHeaderNode;
    title: string;
}

export function ExpandedMappingHeaderWidget(props: ExpandedMappingHeaderWidgetProps) {
    const {node, title} = props;
    const classes = useStyles();

    const onClickOnCollapse = () => {
        node.context.changeSelection(ViewOption.COLLAPSE);
    }

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <div className={classes.fromClause}>
                    {title}
                </div>
                <div className={classes.buttonWrapper}>
                    <IconButton
                        onClick={onClickOnCollapse}
                        className={classes.icons}
                    >
                        <div className={classes.collapseIcon}>
                            <CollapseIcon/>
                        </div>
                    </IconButton>
                </div>
            </div>
        </div>
    );
}
