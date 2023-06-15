/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
// tslint:disable: jsx-no-multiline-js
import * as React from 'react';

import { CircularProgress } from "@material-ui/core";
import { createStyles, makeStyles, Theme, withStyles } from "@material-ui/core/styles";
import TooltipBase from '@material-ui/core/Tooltip';
import ChevronRight from "@material-ui/icons/ChevronRight";
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ExpressionIcon from '@material-ui/icons/ExplicitOutlined';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { ComponentViewInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";
import clsx from 'clsx';

import FunctionIcon from "../../../../assets/icons/FuctionIcon";
import { DiagnosticWidget } from '../../Diagnostic/Diagnostic';
import { DataMapperPortWidget } from '../../Port';
import { getFieldLabel } from '../../utils/dm-utils';

import { LinkConnectorNode } from './LinkConnectorNode';

export const tooltipBaseStyles = {
    tooltip: {
        color: "#8d91a3",
        backgroundColor: "#fdfdfd",
        border: "1px solid #e6e7ec",
        borderRadius: 6,
        padding: "1rem"
    },
    arrow: {
        color: "#fdfdfd"
    }
};

const styles = makeStyles((theme: Theme) => createStyles({
    root: {
        width: '100%',
        backgroundColor: theme.palette.common.white,
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        color: theme.palette.grey[400],
        boxShadow: "0px 5px 50px rgba(203, 206, 219, 0.5)",
        borderRadius: "10px",
		      alignItems: "center",
		      overflow: "hidden",
    },
    element: {
        backgroundColor: theme.palette.common.white,
        padding: "5px",
        cursor: "pointer",
        transitionDuration: "0.2s",
        userSelect: "none",
        pointerEvents: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "&:hover": {
            filter: "brightness(0.95)",
        },
    },
    iconWrapper: {
        height: "22px",
        width: "22px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
        border: '1px solid #e6e7ec',
        borderRadius: '8px',
        position: "absolute",
        right: "35px"
    },
    separator: {
        height: "22px",
        width: "1px",
        backgroundColor: theme.palette.grey[200],
    },
    editIcon: {
        color: theme.palette.grey[300],
        padding: "5px",
        height: "32px",
        width: "32px"
    },
    functionIcon: {
        padding: "3px"
    },
    deleteIcon: {
        color: theme.palette.error.main
    },
    loadingContainer: {
        padding: "10px"
    },
    circularProgress: {
        color: "#CBCEDB"
    }
}));

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
        updateSelectedComponent
    } = node.context;
    const [deleteInProgress, setDeleteInProgress] = React.useState(false);

    const onClickEdit = () => {
        const valueNode = props.node.valueNode;
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

    const TooltipComponent = withStyles(tooltipBaseStyles)(TooltipBase);

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
                <TooltipComponent
                    interactive={false}
                    arrow={true}
                    title={isTnfFunctionCall ? "Transformation Function Call" : "Multi-Input Expression"}
                >
                    <span className={classes.editIcon} >
                        {isTnfFunctionCall ? (
                            <div className={classes.functionIcon} >
                                <FunctionIcon />
                            </div>
                        ) : <ExpressionIcon/>}
                    </span>
                </TooltipComponent>
                {isTnfFunctionCall && (
                    <div className={classes.element} onClick={onClickOnGoToDef} data-testid={`go-to-tnf-fn-${node?.value}`}>
                        <div className={classes.iconWrapper}>
                            <ChevronRight className={clsx(classes.editIcon)}/>
                        </div>
                    </div>
                )}
                <div className={classes.element} onClick={onClickEdit} data-testid={`link-connector-edit-${node?.value}`}>
                    <div className={classes.iconWrapper}>
                        <CodeOutlinedIcon className={clsx(classes.icons, classes.editIcon)}/>
                    </div>
                </div>
                {deleteInProgress ? (
                    <div className={clsx(classes.element, classes.loadingContainer)}>
                        {loadingScreen}
                    </div>
                ) : (
                    <div className={classes.element} onClick={onClickDelete} data-testid={`link-connector-delete-${node?.value}`}>
                        <div className={classes.iconWrapper}>
                            <DeleteIcon className={clsx(classes.deleteIcon)}/>
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
