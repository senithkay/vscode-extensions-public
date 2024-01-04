/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import * as React from 'react';

import { CircularProgress } from "@material-ui/core";
import ChevronRight from "@material-ui/icons/ChevronRight";
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ExpressionIcon from '@material-ui/icons/ExplicitOutlined';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { ComponentViewInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { Tooltip } from '@wso2-enterprise/ui-toolkit';
import { css } from '@emotion/css'
import classnames from "classnames";

import FunctionIcon from "../../../../assets/icons/FuctionIcon";
import { DiagnosticWidget } from '../../Diagnostic/Diagnostic';
import { DataMapperPortWidget } from '../../Port';
import { getFieldLabel } from '../../utils/dm-utils';

import { LinkConnectorNode } from './LinkConnectorNode';

const styles = () => ({
    root: css({
        width: '100%',
        backgroundColor: 'var(--vscode-input-background)',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        color: 'var(--vscode-checkbox-border)',
        boxShadow: '0px 5px 50px var(--vscode-checkbox-border)',
        borderRadius: '10px',
        alignItems: 'center',
        overflow: 'hidden',
    }),
    element: css({
        backgroundColor: 'var(--vscode-input-background)',
        padding: '5px',
        cursor: 'pointer',
        transitionDuration: '0.2s',
        userSelect: 'none',
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '&:hover': {
            filter: 'brightness(0.95)',
        },
    }),
    iconWrapper: css({
        height: '22px',
        width: '22px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }),
    fromClause: css({
        padding: '5px',
        fontFamily: 'monospace',
    }),
    mappingPane: css({
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }),
    header: css({
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),
    icons: css({
        padding: '8px',
        '&:hover': {
            backgroundColor: 'var(--vscode-tab-inactiveBackground)',
        },
    }),
    expandIcon: css({
        height: '15px',
        width: '15px',
        marginTop: '-7px',
    }),
    buttonWrapper: css({
        border: '1px solid var(--vscode-editorWidget-background)',
        borderRadius: '8px',
        position: 'absolute',
        right: '35px',
    }),
    separator: css({
        height: "22px",
        width: "1px",
        backgroundColor: "var(--vscode-editor-lineHighlightBorder)",
    }),
    editIcon: css({
        color: "var(--vscode-pickerGroup-border)",
        padding: "5px",
        height: "32px",
        width: "32px"
    }),
    functionIcon: css({
        padding: "3px"
    }),
    deleteIcon: css({
        color: "var(--vscode-editor-selectionBackground)"
    }),
    loadingContainer: css({
        padding: "10px"
    }),
    circularProgress: css({
        color: "var(--vscode-input-background)"
    })
});

export interface LinkConnectorNodeWidgetProps {
    node: LinkConnectorNode;
    engine: DiagramEngine;
}

export function LinkConnectorNodeWidget(props: LinkConnectorNodeWidgetProps) {
    const node = props.node;
    const classes = styles();
    const engine = props.engine;
    const hasError = node.hasError();
    const diagnostic = hasError ? node.diagnostics[0] : null;
    const fnDef = node.fnDefForFnCall;
    const isTnfFunctionCall = fnDef && fnDef.isExprBodiedFn;

    const {
        enableStatementEditor,
        updateSelectedComponent,
        referenceManager: {
            handleCurrentReferences
        }
    } = node.context;
    const [deleteInProgress, setDeleteInProgress] = React.useState(false);

    const onClickEdit = () => {
        const valueNode = props.node.valueNode;
        const currentReferences = node.sourcePorts.map((port) => port.fieldFQN);
        handleCurrentReferences(currentReferences)
        if (STKindChecker.isSpecificField(valueNode)) {
            enableStatementEditor({
                valuePosition: valueNode.valueExpr.position as NodePosition,
                value: valueNode.valueExpr.source,
                label: (props.node.isPrimitiveTypeArrayElement ? getFieldLabel(props.node.targetPort.parentId)
                    : props.node.editorLabel)
            });
        } else if (STKindChecker.isBinaryExpression(valueNode)) {
            enableStatementEditor({
                valuePosition: valueNode.position as NodePosition,
                value: valueNode.source,
                label: (props.node.isPrimitiveTypeArrayElement ? getFieldLabel(props.node.targetPort.portName)
                    : props.node.editorLabel)
            });
        } else {
            props.node.context.enableStatementEditor({
                valuePosition: valueNode.position as NodePosition,
                value: valueNode.source,
                label: "Expression"
            });
        }
    };

    const onClickDelete = () => {
        setDeleteInProgress(true);
        if (node.deleteLink) {
            node.deleteLink();
        }
    };

    const onClickOnGoToDef = async (evt: React.MouseEvent) => {
        evt.stopPropagation();
        const {fnDefPosition, fileUri, fnName} = fnDef;
        const fnDefFilePath = fileUri.replace(/^file:\/\//, "");
        const componentViewInfo: ComponentViewInfo = {
            filePath: fnDefFilePath,
            position: fnDefPosition,
            name: fnName
        }
        updateSelectedComponent(componentViewInfo);
    }

    const loadingScreen = (
        <CircularProgress
            size={22}
            thickness={3}
            className={classes.circularProgress}
        />
    );

    return (!node.hidden && (
        <div className={classes.root} data-testid={`link-connector-node-${node?.value}`}>
            <div className={classes.header}>
                <DataMapperPortWidget engine={engine} port={node.inPort} dataTestId={`link-connector-node-${node?.value}-input`}/>
                <Tooltip
                    content={isTnfFunctionCall ? "Transformation Function Call" : "Multi-Input Expression"}
                >
                    <span className={classes.editIcon} >
                        {isTnfFunctionCall ? (
                            <div className={classes.functionIcon} >
                                <FunctionIcon />
                            </div>
                        ) : <ExpressionIcon/>}
                    </span>
                </Tooltip>
                {isTnfFunctionCall && (
                    <div className={classes.element} onClick={onClickOnGoToDef} data-testid={`go-to-tnf-fn-${node?.value}`}>
                        <div className={classes.iconWrapper}>
                            <ChevronRight className={classnames(classes.editIcon)}/>
                        </div>
                    </div>
                )}
                <div className={classes.element} onClick={onClickEdit} data-testid={`link-connector-edit-${node?.value}`}>
                    <div className={classes.iconWrapper}>
                        <CodeOutlinedIcon className={classnames(classes.icons, classes.editIcon)}/>
                    </div>
                </div>
                {deleteInProgress ? (
                    <div className={classnames(classes.element, classes.loadingContainer)}>
                        {loadingScreen}
                    </div>
                ) : (
                    <div className={classes.element} onClick={onClickDelete} data-testid={`link-connector-delete-${node?.value}`}>
                        <div className={classes.iconWrapper}>
                            <DeleteIcon className={classnames(classes.deleteIcon)}/>
                        </div>
                    </div>
                )}
                { diagnostic && (
                    <div className={classes.element}>
                        <DiagnosticWidget
                            diagnostic={diagnostic}
                            value={props.node.valueNode.source}
                            onClick={onClickEdit}
                        />
                    </div>
                )}
                <DataMapperPortWidget engine={engine} port={node.outPort} dataTestId={`link-connector-node-${node?.value}-output`}/>
            </div>
        </div>
        )
    );
}
