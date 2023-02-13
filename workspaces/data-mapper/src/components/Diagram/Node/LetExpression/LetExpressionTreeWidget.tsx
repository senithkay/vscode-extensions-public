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
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { ReactNode, useMemo } from 'react';

import styled from "@emotion/styled";
import { Button, IconButton } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { CaptureBindingPattern, STKindChecker } from "@wso2-enterprise/syntax-tree";

import SquareEditIcon from "../../../../assets/icons/SquareEditIcon";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { RecordFieldPortModel } from '../../Port';
import { LET_EXPRESSION_SOURCE_PORT_PREFIX } from "../../utils/constants";
import { TreeContainer } from '../commons/Tree/Tree';

import { DMLetVarDecl } from "./index";
import { LetVarDeclItemWidget } from "./LetVarDeclItemWidget";
import { useStyles } from "./style";

export interface LetExpressionTreeWidgetProps {
    letVarDecls: DMLetVarDecl[];
    engine: DiagramEngine;
    context: IDataMapperContext;
    isWithinQuery: boolean;
    getPort: (portId: string) => RecordFieldPortModel;
    handleCollapse: (portName: string, isExpanded?: boolean) => void;
}

export function LetExpressionTreeWidget(props: LetExpressionTreeWidgetProps) {
    const { engine, letVarDecls, context, isWithinQuery, getPort, handleCollapse } = props;
    const classes = useStyles();
    const selectedST = context.selection.selectedST.stNode;

    const onClick = () => {
        context.handleLocalVarConfigPanel(true);
    };

    const letVarDeclItems: ReactNode[] = useMemo(() => {
        return letVarDecls.map(decl => {
            const isExprPlaceholder = decl.declaration.expression.source.trim() === "EXPRESSION";
            const isSelfReferencedWithinQuery = isWithinQuery
                && STKindChecker.isLetVarDecl(selectedST)
                && (selectedST.typedBindingPattern.bindingPattern as CaptureBindingPattern)
                    .variableName.value === decl.varName;
            if (!isExprPlaceholder && !isSelfReferencedWithinQuery) {
                return (
                    <LetVarDeclItemWidget
                        key={`${LET_EXPRESSION_SOURCE_PORT_PREFIX}.${decl.varName}`}
                        id={`${LET_EXPRESSION_SOURCE_PORT_PREFIX}.${decl.varName}`}
                        engine={engine}
                        declaration={decl.declaration}
                        context={context}
                        typeDesc={decl.type}
                        getPort={(portId: string) => getPort(portId) as RecordFieldPortModel}
                        handleCollapse={handleCollapse}
                        valueLabel={decl.varName}
                    />
                );
            }
        }).filter(decl => !!decl);
    }, [letVarDecls]);

    return (
        <>
            {letVarDeclItems.length > 0 ? (
                <TreeContainer>
                    <LocalVarsHeader>
                        <HeaderText>Local Variables</HeaderText>
                        {!isWithinQuery && (
                            <IconButton
                                onClick={onClick}
                            >
                                <SquareEditIcon color={"#3d3b3b"} />
                            </IconButton>
                        )}
                    </LocalVarsHeader>
                    {letVarDeclItems}
                </TreeContainer>
            ) : !isWithinQuery && (
                <LocalVarAddButton>
                    <Button
                        aria-label="add"
                        className={classes.addIcon}
                        onClick={onClick}
                        startIcon={<AddIcon />}
                    >
                        Add Local Variable
                    </Button>
                </LocalVarAddButton>
            )}
        </>
    );
}

const LocalVarAddButton = styled.div`
    padding: 10px;
    background: #FFFFFF;
    border-radius: 12px;
`;

const LocalVarsHeader = styled.div`
    background: #f6f7fc;
    width: 100%;
    line-height: 35px;
    display: flex;
    justify-content: space-between;
`;

const HeaderText = styled.span`
    margin-left: 10px;
    min-width: 280px;
    font-size: 13px;
    font-weight: 600;
    font-family: "Gilmer",sans-serif;
`;
