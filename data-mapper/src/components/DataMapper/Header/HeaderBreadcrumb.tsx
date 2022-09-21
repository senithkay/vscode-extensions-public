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

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { theme } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { SelectionState, ViewOption } from "../DataMapper";

const useStyles = makeStyles(() =>
    createStyles({
        breadcrumb: {
            '& > * + *': {
                marginTop: theme.spacing(2),
            },
        },
    })
);

export interface HeaderBreadcrumbProps {
    functionName: string;
    selection: SelectionState;
    changeSelection: (mode: ViewOption, selection?: SelectionState) => void;
}

export default function HeaderBreadcrumb(props: HeaderBreadcrumbProps) {
    const { functionName, selection, changeSelection } = props;
    const classes = useStyles();

    const links = selection.prevST.length > 0 && (
        selection.prevST.map((node, index) => {
            return (index === selection.prevST.length - 1) ? (
                <Typography color="textPrimary">{`query${index + 1}`}</Typography>
            ) : (
                <Link
                    key={index}
                    underline="hover"
                    onClick={handleClick}
                >
                    {`query${index + 1}`}
                </Link>
            );
        })
    );

    function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        event.preventDefault();
        changeSelection(ViewOption.COLLAPSE);
    }

    return (
        <div className={classes.breadcrumb}>
            <Breadcrumbs aria-label="breadcrumb">
                {selection.prevST.length === 0 ? (
                    <Typography color="textPrimary">{functionName}</Typography>
                ) : (
                    <Link onClick={handleClick}>
                        {functionName}
                    </Link>
                )}
                {links}
            </Breadcrumbs>
        </div>
    );
}
