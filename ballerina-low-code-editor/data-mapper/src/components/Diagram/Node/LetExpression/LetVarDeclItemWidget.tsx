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
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExitToApp from "@material-ui/icons/ExitToApp";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { LetVarDecl, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { ViewOption } from "../../../DataMapper/DataMapper";
import { isGoToQueryWithinLetExprSupported } from "../../../DataMapper/utils";
import { DataMapperPortWidget, RecordFieldPortModel } from '../../Port';
import { getTypeName } from "../../utils/dm-utils";
import { RecordFieldTreeItemWidget } from "../commons/RecordTypeTreeWidget/RecordFieldTreeItemWidget";
import { TreeBody, TreeHeader } from '../commons/Tree/Tree';

import { useStyles } from "./style";

export interface LetVarDeclItemProps {
    id: string; // this will be the root ID used to prepend for UUIDs of nested fields
    typeDesc: Type;
    engine: DiagramEngine;
    declaration: LetVarDecl;
    context: IDataMapperContext;
    getPort: (portId: string) => RecordFieldPortModel;
    handleCollapse: (portName: string, isExpanded?: boolean) => void;
    valueLabel?: string;
}

export function LetVarDeclItemWidget(props: LetVarDeclItemProps) {
    const { engine, typeDesc, id, declaration, context, getPort, handleCollapse, valueLabel } = props;
    const classes = useStyles();

    const typeName = getTypeName(typeDesc);
    const portOut = getPort(`${id}.OUT`);
    const expanded = !(portOut && portOut.collapsed);
    const isRecord = typeDesc.typeName === PrimitiveBalType.Record;
    const isQueryExpr = STKindChecker.isQueryExpression(declaration.expression);

    const label = (
        <span style={{ marginRight: "auto" }}>
            <span className={classes.valueLabel}>
                {valueLabel ? valueLabel : id}
                {typeName && ":"}
            </span>
            {typeName && (
                <span className={classes.typeLabel}>
                    {typeName !== `$CompilationError$` ? typeName : 'var'}
                </span>
            )}

        </span>
    );

    const handleExpand = () => {
        handleCollapse(id, !expanded);
    }

    const onClickOnExpand = () => {
        context.changeSelection(ViewOption.EXPAND,
            {
                ...context.selection,
                selectedST: {
                    stNode: declaration,
                    fieldPath: `LetExpr.${valueLabel ? valueLabel : id}`
                }
            });
    }

    return (
        <>
            <TreeHeader>
                <span className={classes.label}>
                    {isRecord && (
                        <IconButton
                            className={classes.expandIcon}
                            onClick={handleExpand}
                            data-testid={`${id}-expand-icon-record-source-node`}
                        >
                            {expanded ? <ExpandMoreIcon/> : <ChevronRightIcon/>}
                        </IconButton>
                    )}
                    {label}
                    {isQueryExpr && isGoToQueryWithinLetExprSupported(context.ballerinaVersion) && (
                        <div className={classes.gotoExprIcon} onClick={onClickOnExpand}>
                            <ExitToApp />
                        </div>
                    )}
                </span>
                <span className={classes.treeLabelOutPort}>
                    {portOut &&
                        <DataMapperPortWidget engine={engine} port={portOut} />
                    }
                </span>
            </TreeHeader>
            {
                expanded && isRecord && (
                    <TreeBody>
                        {typeDesc.fields.map((field) => {
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
                        })}
                    </TreeBody>
                )
            }
        </>
    );
}
