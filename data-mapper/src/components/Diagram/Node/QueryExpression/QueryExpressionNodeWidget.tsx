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

import { IconButton } from "@material-ui/core";
import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { STKindChecker } from '@wso2-enterprise/syntax-tree';

import ExpandIcon from "../../../../assets/icons/ExpandIcon";
import { ViewOption } from "../../../DataMapper/DataMapper";
import { DataMapperPortModel, DataMapperPortWidget } from '../../Port';
import { MappingConstructorWidget } from '../commons/MappingConstructorWidget/MappingConstructorWidget';
import { RecordTypeTreeWidget } from '../commons/RecordTypeTreeWidget/RecordTypeTreeWidget';

import {
    QueryExpressionNode,
    QUERY_SOURCE_PORT_PREFIX,
    QUERY_TARGET_PORT_PREFIX
} from './QueryExpressionNode';

const styles = (theme: Theme) => createStyles({
    root: {
        width: '100%',
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
    mappingPane: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
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
    expandIcon: {
        height: '15px',
        width: '15px',
        marginTop: '-7px'
    },
    buttonWrapper: {
        border: '1px solid #e6e7ec',
        borderRadius: '8px',
        right: "35px"
    }
});

export interface QueryExpressionNodeWidgetProps extends WithStyles<typeof styles> {
    node: QueryExpressionNode;
    engine: DiagramEngine;
}

class QueryExpressionNodeWidgetC extends React.Component<QueryExpressionNodeWidgetProps> {
    render() {
        const node = this.props.node;
        const classes = this.props.classes;
        const engine = this.props.engine;

        const getSourcePort = (portId: string) => {
            return node.getPort(portId) as DataMapperPortModel;
        }

        const getTargetPort = (portId: string) => {
            return node.getPort(portId) as DataMapperPortModel;
        }

        const onClickOnExpand = () => {
            node.context.changeSelection(ViewOption.EXPAND,
                {
                    ...node.context.selection,
                    selectedST: node.value
                })
        }

        return (
            <>
                {/* TODO: Identify inner query expressions and render minimized boxes to denote those with links */}
                {!!node.sourcePort && (
                    <div
                        className={classes.root}
                    >
                        <div className={classes.header}>
                            <DataMapperPortWidget engine={engine} port={node.inPort}/>
                            <div className={classes.fromClause}>
                                Query
                            </div>
                            <div className={classes.buttonWrapper}>
                                <IconButton
                                    onClick={onClickOnExpand}
                                    className={classes.icons}
                                >
                                    <div className={classes.expandIcon}>
                                        <ExpandIcon/>
                                    </div>
                                </IconButton>
                            </div>
                            <DataMapperPortWidget engine={engine} port={node.outPort}/>
                        </div>
                    </div>
                )}
            </>
        );
    }
}

export const QueryExpressionNodeWidget = withStyles(styles, {withTheme: true})(QueryExpressionNodeWidgetC);
