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
import React, { ReactNode } from "react";

import { createStyles, makeStyles } from "@material-ui/core/styles";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { TreeContainer } from "../commons/Tree/Tree";

interface UnsupportedIOProp {
    children: ReactNode
}

interface UnsupportedExprProps {
    filePath: string;
    exprPosition: NodePosition;
}

interface UnsupportedIOProps {
    message: string;
}

const useStyles = makeStyles(() =>
    createStyles({
        treeContainer: {
            cursor: "default"
        },
        unsupportedIOBanner: {
            width: "320px"
        },
        filePath: {
            fontFamily: "monospace",
            fontWeight: 100
        }
    })
);

function UnsupportedExpr({ children }: UnsupportedIOProp) {
    const classes = useStyles();
    return (
        <TreeContainer className={classes.treeContainer}>
            <span className={classes.unsupportedIOBanner}>
                {children}
            </span>
        </TreeContainer>
    );
}

export function UnsupportedExprWidget({ filePath, exprPosition }: UnsupportedExprProps) {
    const classes = useStyles();
    return (
        <UnsupportedExpr>
            <span>
                {`The expression at `}
            </span>
            <span className={classes.filePath}>
                {`${filePath}:${exprPosition.startLine}:${exprPosition.startColumn} `}
            </span>
            <span>
                {`is currently not supported by the Data Mapper.`}
            </span>
            <br/><br/>
            <span>
                {`Please change the source and try again`}
            </span>
        </UnsupportedExpr>
    );
}

export function UnsupportedIOWidget({ message }: UnsupportedIOProps) {
    return (
        <UnsupportedExpr>
            <span>
                {message}
            </span>
        </UnsupportedExpr>
    );
}
