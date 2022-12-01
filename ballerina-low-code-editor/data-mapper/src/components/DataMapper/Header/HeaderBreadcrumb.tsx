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
import React, { useMemo } from 'react';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

import { SelectionState, ViewOption } from "../DataMapper";

const useStyles = makeStyles(() =>
    createStyles({
        active: {
            cursor: "default",
            color: "textPrimary",
            lineHeight: "unset"
        },
        link: {
            cursor: "pointer"
        },
        breadcrumb: {
            lineHeight: "unset",
            "& .MuiBreadcrumbs-separator": {
                margin: "2px"
            }
        }
    })
);


export interface HeaderBreadcrumbProps {
    selection: SelectionState;
    changeSelection: (mode: ViewOption, selection?: SelectionState, navIndex?: number) => void;
}

export default function HeaderBreadcrumb(props: HeaderBreadcrumbProps) {
    const { selection, changeSelection } = props;
    const classes = useStyles();

    const [activeLink, links] = useMemo(() => {
        if (selection.selectedST.stNode) {
            let isFnDef = STKindChecker.isFunctionDefinition(selection.selectedST.stNode);
            let label = selection.selectedST.fieldPath;
            const selectedLink = (
                <Typography className={classes.active}>
                    {isFnDef ? label : `${label}:query`}
                </Typography>
            );

            const restLinks = selection.prevST.length > 0 && (
                selection.prevST.map((node, index) => {
                    label = node.fieldPath;
                    isFnDef = STKindChecker.isFunctionDefinition(node.stNode);
                    return (
                        <Link
                            data-index={index}
                            key={index}
                            underline="hover"
                            onClick={handleClick}
                            className={classes.link}
                        >
                            {isFnDef ? label : `${label}:query`}
                        </Link>
                    );
                })
            );

            return [selectedLink, restLinks];
        }
        return [undefined, undefined];
    }, [selection]);

    function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        event.preventDefault();
        const index: number = +event.currentTarget.getAttribute('data-index');
        changeSelection(ViewOption.NAVIGATE, undefined, index);
    }

    return (
        <Breadcrumbs
            maxItems={3}
            separator={<NavigateNextIcon fontSize="small" />}
            className={classes.breadcrumb}
        >
            {links}
            {activeLink}
        </Breadcrumbs>
    );
}
