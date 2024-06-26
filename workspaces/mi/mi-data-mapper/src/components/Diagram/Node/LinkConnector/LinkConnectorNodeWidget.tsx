/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useState } from "react";

import { DiagramEngine } from '@projectstorm/react-diagrams';
import { ProgressRing } from '@wso2-enterprise/ui-toolkit';
import classnames from "classnames";
import { Node } from "ts-morph";

import { LinkConnectorNode } from './LinkConnectorNode';
import { useIntermediateNodeStyles } from '../../../styles';
import { getEditorLineAndColumn, hasCallExpressions } from '../../utils/common-utils';
import { DiagnosticWidget } from '../../Diagnostic/DiagnosticWidget';
import {
    renderDeleteButton,
    renderEditButton,
    renderFunctionCallTooltip,
    renderExpressionTooltip,
    renderPortWidget
} from './LinkConnectorWidgetComponents';

export interface LinkConnectorNodeWidgetProps {
    node: LinkConnectorNode;
    engine: DiagramEngine;
}

export function LinkConnectorNodeWidget(props: LinkConnectorNodeWidgetProps) {
    const { node, engine } = props;
    const { goToSource } = node.context;
    const classes = useIntermediateNodeStyles();
    const diagnostic = node.hasError() ? node.diagnostics[0] : null;
    const isValueNodeForgotten = node.valueNode.wasForgotten();
    const hasCallExprs = !isValueNodeForgotten && hasCallExpressions(node.valueNode);
    const value = !isValueNodeForgotten && node.valueNode.getText();

    const [deleteInProgress, setDeleteInProgress] = useState(false);

    const onClickEdit = () => {
        let nodeToBeEdited = node.innerNode;
        const range = getEditorLineAndColumn(nodeToBeEdited);
        goToSource(range);
    };

    const onClickDelete = async () => {
        setDeleteInProgress(true);
        if (node.deleteLink) {
            await node.deleteLink();
        }
        setDeleteInProgress(false);
    };

    const loadingScreen = (
        <div className={classnames(classes.element, classes.loadingContainer)}>
            <ProgressRing sx={{ height: '16px', width: '16px' }} />
        </div>
    );

    return (!node.hidden && (
            <div className={classes.root} data-testid={`link-connector-node-${node?.value}`}>
                <div className={classes.header}>
                    {renderPortWidget(engine, node.inPort, `${node?.value}-input`)}
                    {hasCallExprs ? renderFunctionCallTooltip() :  renderExpressionTooltip()}
                    {renderEditButton(onClickEdit, node?.value)}
                    {deleteInProgress ? (
                        loadingScreen
                    ) : (
                        <>{renderDeleteButton(onClickDelete, node?.value)}</>
                    )}
                    {diagnostic && (
                        <DiagnosticWidget
                            diagnostic={diagnostic}
                            value={value}
                            onClick={onClickEdit}
                            btnSx={{ margin: "0 2px" }}
                        />
                    )}
                    {renderPortWidget(engine, node.outPort, `${node?.value}-output`)}
                </div>
            </div>
        )
    );
}
