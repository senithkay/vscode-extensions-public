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

import ExpandIcon from "../../../../assets/icons/ExpandIcon";
import { ViewOption } from "../../../DataMapper/DataMapper";
import { DataMapperPortWidget, RecordFieldPortModel, SpecificFieldPortModel } from '../../Port';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';

import {
    QueryExpressionNode,
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
        alignItems: "center"
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
        display: 'flex',
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

        const onClickOnExpand = () => {
            node.context.changeSelection(ViewOption.EXPAND,
                {
                    ...node.context.selection,
                    selectedST: node.value
                })
        }

        const deleteQueryLink = () => {
            const modifications = [
                {
                    type: "INSERT",
                    config: {
                        "STATEMENT": this.props.node.value.queryPipeline.fromClause.expression.source?.trim(),
                    },
                    ...this.props.node.value.position
                }
            ];
            node.context.applyModifications(modifications);
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
                                <IconButton
                                    onClick={deleteQueryLink}
                                    className={classes.icons}
                                >
                                    <div className={classes.expandIcon}>
                                        <DeleteIcon />
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