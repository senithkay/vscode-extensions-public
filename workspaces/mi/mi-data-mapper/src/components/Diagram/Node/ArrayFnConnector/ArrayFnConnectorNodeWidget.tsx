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
import { ArrayFnConnectorNode } from './ArrayFnConnectorNode';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { useIntermediateNodeStyles } from '../../../../components/styles';
import { Button, Codicon, ProgressRing, Tooltip } from '@wso2-enterprise/ui-toolkit';
import { DataMapperPortWidget } from '../../Port';
import classnames from 'classnames';
import { getTypeName } from '../../utils/common-utils';

export interface ArrayFnConnectorNodeWidgetWidgetProps {
    node: ArrayFnConnectorNode;
    engine: DiagramEngine;
}

export function ArrayFnConnectorNodeWidget(props: ArrayFnConnectorNodeWidgetWidgetProps) {
    const { node, engine } = props;
    const { context, sourcePort, targetPort, inPort, outPort, hidden } = node;
    const { addView, views } = context;

    const [deleteInProgress, setDeleteInProgress] = React.useState(false);

    const classes = useIntermediateNodeStyles();

    const onClickOnExpand = () => {
        let label = targetPort.fieldFQN;
        let targetFieldFQN = targetPort.fieldFQN;
        let sourceFieldFQN = sourcePort.fieldFQN.split('.').slice(1).join('.');

        if (views.length > 1) {
            const prevView = views[views.length - 1];
            if (prevView.targetFieldFQN !== '') {
                targetFieldFQN = `${prevView.targetFieldFQN}.${targetFieldFQN}`;
            }
            if (prevView.sourceFieldFQN !== '') {
                sourceFieldFQN = `${prevView.sourceFieldFQN}.${sourceFieldFQN}`;
            }
        } else if (views.length === 1 && !targetFieldFQN) {
            // Map function at the root level return statement
            label = getTypeName(targetPort.field?.memberType);
        }
        addView({ targetFieldFQN, sourceFieldFQN, label });
    }

    const deleteLink = async () => {
        setDeleteInProgress(true);
        await node.deleteLink();
        setDeleteInProgress(false);
    }

    const loadingScreen = (
        <ProgressRing sx={{ height: '16px', width: '16px' }} />
    );

    return (!hidden && (
        <>
            {(!!sourcePort && !!inPort && !!outPort) && (
                <div className={classes.root} >
                    <div className={classes.header}>
                        <DataMapperPortWidget engine={engine} port={inPort} />
                        <Tooltip content={"Array Function"} position="bottom">
                            <Codicon name="list-unordered" iconSx={{ color: "var(--vscode-input-placeholderForeground)" }} />
                        </Tooltip>
                        <Button
                            appearance="icon"
                            tooltip="Go to function"
                            onClick={onClickOnExpand}
                            data-testid={`expand-array-fn-${node?.targetFieldFQN}`}
                        >
                            <Codicon name="export" iconSx={{ color: "var(--vscode-input-placeholderForeground)" }} />
                        </Button>
                        {deleteInProgress ? (
                            <div className={classnames(classes.element, classes.loadingContainer)}>
                                {loadingScreen}
                            </div>
                        ) : (
                            <Button
                                appearance="icon"
                                tooltip="Delete"
                                onClick={deleteLink} data-testid={`delete-query-${node?.targetFieldFQN}`}
                            >
                                <Codicon name="trash" iconSx={{ color: "var(--vscode-errorForeground)" }} />
                            </Button>
                        )}
                        <DataMapperPortWidget engine={engine} port={outPort} />
                    </div>
                </div>
            )}
        </>
    ));
}
