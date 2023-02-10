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

import { IconButton } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams';
import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { DataMapperPortWidget, RecordFieldPortModel } from '../../../Port';
import { EXPANDED_QUERY_INPUT_NODE_PREFIX } from '../../../utils/constants';
import { getTypeName } from "../../../utils/dm-utils";
import { TreeBody, TreeContainer, TreeHeader } from '../Tree/Tree';

import { RecordFieldTreeItemWidget } from "./RecordFieldTreeItemWidget";

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
            display: "flex",
            alignItems: "center"
        },
        treeLabelInPort: {
            float: "left",
            // marginRight: "5px",
            width: 'fit-content',
            display: "flex",
            alignItems: "center"
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
        },
        queryPortWrap: {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center'
        },
        nodeType: {
            float: 'right',
            marginRight: 5,
            color: theme.palette.grey[300],
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
    nodeHeaderSuffix?: string;
}

export function RecordTypeTreeWidget(props: RecordTypeTreeWidgetProps) {
    const { engine, typeDesc, id, getPort, handleCollapse, valueLabel, nodeHeaderSuffix } = props;
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

    /** Invisible port to which the right angle link from the query header/clauses are connected to */
    const invisiblePort = getPort(`${EXPANDED_QUERY_INPUT_NODE_PREFIX}.${valueLabel}`);

    return (
        <TreeContainer data-testid={`${id}-node`}>
            <div className={classes.queryPortWrap}>
                {invisiblePort && <PortWidget port={invisiblePort} engine={engine} />}
            </div>

            <TreeHeader>
                <div id={"recordfield-" + id}>
                    <span className={classes.treeLabelInPort}>
                        {portIn &&
                            <DataMapperPortWidget engine={engine} port={portIn} />
                        }
                    </span>
                    <span className={classes.label}>
                        <IconButton
                            id={"button-wrapper-" + id}
                            className={classes.expandIcon}
                            onClick={handleExpand}
                            data-testid={`${id}-expand-icon-record-source-node`}
                        >
                            {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                        </IconButton>
                        {label}
                        <span className={classes.nodeType}>{nodeHeaderSuffix}</span>
                    </span>
                    <span className={classes.treeLabelOutPort}>
                        {portOut &&
                            <DataMapperPortWidget engine={engine} port={portOut} />
                        }
                    </span>
                </div>
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

