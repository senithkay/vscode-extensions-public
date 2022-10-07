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
import * as React from 'react';

import styled from '@emotion/styled';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { DataMapperPortWidget, RecordFieldPortModel } from '../../../Port';
import { getTypeName } from "../../../utils/dm-utils";

import { RecordFieldTreeItemWidget } from "./RecordFieldTreeItemWidget";
import { TreeContainer, TreeHeader, TreeBody } from '../Tree/Tree';
import { IconButton } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        typeLabel: {
            marginLeft: "3px",
            verticalAlign: "middle",
            padding: "5px",
            minWidth: "100px",
            marginRight: "24px"
        },
        valueLabel: {
            verticalAlign: "middle",
            padding: "5px",
        },
        treeLabelOutPort: {
            float: "right",
            width: 'fit-content',
            marginLeft: "auto",
        },
        treeLabelInPort: {
            float: "left",
            // marginRight: "5px",
            width: 'fit-content',
        },
        label: {
            width: "300px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            display: "inline-block",
            textOverflow: "ellipsis",
            "&:hover": {
                overflow: "visible"
            }
        },
        expandIcon: {
            color: theme.palette.common.black,
            height: "25px",
            width: "25px",
            marginLeft: "auto"
        }
    }),
);

export interface RecordTypeTreeWidgetProps {
    id: string; // this will be the root ID used to prepend for UUIDs of nested fields
    typeDesc: Type;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    handleCollapse: (portName: string, isExpanded?: boolean) => void;
    valueLabel?: string;
}

export function RecordTypeTreeWidget(props: RecordTypeTreeWidgetProps) {
    const { engine, typeDesc, id, getPort, handleCollapse, valueLabel } = props;
    const classes = useStyles();

    const typeName = getTypeName(typeDesc);

    const portIn = getPort(`${id}.IN`);
    const portOut = getPort(`${id}.OUT`);

    let expanded = true;
    if ((portIn && portIn.collapsed) || (portOut && portOut.collapsed)) {
        expanded = false;
    }

    const label = (
        <span style={{ marginRight: "auto" }}>
            <span className={classes.valueLabel}>
                {valueLabel ? valueLabel : id}
                {typeName && ":"}
            </span>
            {typeName && (
                <span className={classes.typeLabel}>
                    {typeName}
                </span>
            )}

        </span>
    );

    const handleExpand = () => {
        handleCollapse(id, !expanded);
    }


    return (
        <TreeContainer>
            <TreeHeader>
                <span className={classes.treeLabelInPort}>
                    {portIn &&
                        <DataMapperPortWidget engine={engine} port={portIn} />
                    }
                </span>
                <span className={classes.label}>
                    <IconButton
                        className={classes.expandIcon}
                        onClick={handleExpand}
                    >
                        {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                    </IconButton>
                    {label}
                </span>
                <span className={classes.treeLabelOutPort}>
                    {portOut &&
                        <DataMapperPortWidget engine={engine} port={portOut} />
                    }
                </span>
            </TreeHeader>
            <TreeBody>
                {expanded &&
                    typeDesc?.fields?.map((field) => {
                        return (
                            <RecordFieldTreeItemWidget
                                key={id}
                                engine={engine}
                                field={field}
                                getPort={getPort}
                                parentId={id}
                                handleCollapse={handleCollapse}
                                treeDepth={0}
                            />
                        );
                    })
                }
            </TreeBody>
        </TreeContainer>
    );
}

