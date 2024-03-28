/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import * as React from 'react';

import { DiagramEngine } from '@projectstorm/react-diagrams';
import { NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { Button, Codicon, Icon, ProgressRing, Tooltip } from '@wso2-enterprise/ui-toolkit';
import { css } from '@emotion/css'
import classnames from "classnames";

import { DataMapperPortWidget } from '../../Port';

import { LinkConnectorNode } from './LinkConnectorNode';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

const styles = () => ({
    root: css({
        width: '100%',
        backgroundColor: "var(--vscode-sideBar-background)",
        padding: "2px",
        borderRadius: "2px",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        color: "var(--vscode-checkbox-border)",
        alignItems: "center",
        border: "1px solid var(--vscode-welcomePage-tileBorder)",
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
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        "& > *": {
            margin: "0 2px"
        }
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
    const { rpcClient } = useVisualizerContext();

    // const {
    //     enableStatementEditor,
    //     updateSelectedComponent,
    //     referenceManager: {
    //         handleCurrentReferences
    //     }
    // } = node.context;
    const [deleteInProgress, setDeleteInProgress] = React.useState(false);

    const onClickEdit = () => {
        // const valueNode = props.node.valueNode;
        // const currentReferences = node.sourcePorts.map((port) => port.fieldFQN);
        // handleCurrentReferences(currentReferences)
        // if (STKindChecker.isSpecificField(valueNode)) {
        //     enableStatementEditor({
        //         valuePosition: valueNode.valueExpr.position as NodePosition,
        //         value: valueNode.valueExpr.source,
        //         label: props.node.editorLabel
        //     });
        // } else if (STKindChecker.isBinaryExpression(valueNode)) {
        //     enableStatementEditor({
        //         valuePosition: valueNode.position as NodePosition,
        //         value: valueNode.source,
        //         label: props.node.editorLabel
        //     });
        // } else {
        //     props.node.context.enableStatementEditor({
        //         valuePosition: valueNode.position as NodePosition,
        //         value: valueNode.source,
        //         label: "Expression"
        //     });
        // }
    };

    const onClickDelete = () => {
        setDeleteInProgress(true);
        if (node.deleteLink) {
            node.deleteLink();
        }
    };

    const loadingScreen = (
        <ProgressRing sx={{ height: '16px', width: '16px' }} />
    );

    return (!node.hidden && (
        <div className={classes.root} data-testid={`link-connector-node-${node?.value}`}>
            <div className={classes.header}>
                <DataMapperPortWidget engine={engine} port={node.inPort} dataTestId={`link-connector-node-${node?.value}-input`}/>
                <Tooltip
                    content={"Multi-Input Expression"}
                    position="bottom-end"
                >
                    {(
                        <Icon name="explicit-outlined" sx={{ height: "20px", width: "20px" }} iconSx={{ fontSize: "20px", color: "var(--vscode-input-placeholderForeground)" }} />
                    )}
                </Tooltip>
                <Button
                    appearance="icon"
                    onClick={onClickEdit}
                    data-testid={`link-connector-edit-${node?.value}`}
                >
                    <Codicon name="code" iconSx={{ color: "var(--vscode-input-placeholderForeground)" }} />
                </Button>
                {deleteInProgress ? (
                    <div className={classnames(classes.element, classes.loadingContainer)}>
                        {loadingScreen}
                    </div>
                ) : (
                    <Button
                        appearance="icon"
                        onClick={onClickDelete} data-testid={`link-connector-delete-${node?.value}`}
                    >
                        <Codicon name="trash" iconSx={{ color: "var(--vscode-errorForeground)" }} />
                    </Button>
                )}
                <DataMapperPortWidget engine={engine} port={node.outPort} dataTestId={`link-connector-node-${node?.value}-output`}/>
            </div>
        </div>
        )
    );
}
