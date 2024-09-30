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
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { Button, Codicon, ProgressRing, Tooltip } from '@wso2-enterprise/ui-toolkit';
import { TypeKind } from '@wso2-enterprise/mi-core';
import classnames from 'classnames';

import { useIntermediateNodeStyles } from '../../../../components/styles';
import { ArrayFnConnectorNode } from './ArrayFnConnectorNode';
import { DataMapperPortWidget, InputOutputPortModel } from '../../Port';
import { getMapFnIndex, getMapFnViewLabel, hasElementAccessExpression } from '../../utils/common-utils';
import { SUB_MAPPING_INPUT_SOURCE_PORT_PREFIX } from '../../utils/constants';
import { getSourceNodeType } from '../../utils/node-utils';
import { SubMappingInfo, View } from '../../../../components/DataMapper/Views/DataMapperView';
import { ElementAccessExpression, PropertyAssignment } from 'ts-morph';
import { useDMExpressionBarStore } from "../../../../store/store";

export interface ArrayFnConnectorNodeWidgetWidgetProps {
    node: ArrayFnConnectorNode;
    engine: DiagramEngine;
}

export function ArrayFnConnectorNodeWidget(props: ArrayFnConnectorNodeWidgetWidgetProps) {
    const { node, engine } = props;
    const { context, sourcePort, targetPort, inPort, outPort, hidden } = node;
    const { addView, views } = context;
    const isSourcePortSubMapping = sourcePort.portName.startsWith(SUB_MAPPING_INPUT_SOURCE_PORT_PREFIX);
    const sourceNodeType = getSourceNodeType(sourcePort);
    const isValueNodeForgotten = node.parentNode.wasForgotten();
    const hasElementAccessExpr = !isValueNodeForgotten && hasElementAccessExpression(node.parentNode);


    const [deleteInProgress, setDeleteInProgress] = React.useState(false);

    const classes = useIntermediateNodeStyles();

    const setExprBarFocusedPort = useDMExpressionBarStore(state => state.setFocusedPort);


    const onClickOnExpand = () => {
        let label = getMapFnViewLabel(targetPort, views);
        let targetFieldFQN = targetPort.fieldFQN;
        let sourceFieldFQN = isSourcePortSubMapping
            ? sourcePort.fieldFQN
            : sourcePort.fieldFQN.split('.').slice(1).join('.');
        let mapFnIndex: number | undefined = undefined;
        let prevViewSubMappingInfo: SubMappingInfo = undefined;

        if (views.length > 1) {
            const prevView = views[views.length - 1];

            if (prevView.subMappingInfo) {
                // Navigating into map function within focused sub-mapping view
                prevViewSubMappingInfo = prevView.subMappingInfo;
                const { mappingName: prevViewMappingName, mapFnIndex: prevViewMapFnIndex } = prevViewSubMappingInfo;
                targetFieldFQN = targetFieldFQN ?? prevViewMappingName;
            } else {
                // Navigating into another map function within the current map function
                if (!prevView.targetFieldFQN) {
                    // The visiting map function is declaired at the return statement of the current map function
                    if (!targetFieldFQN && targetPort.field.kind === TypeKind.Array) {
                        // The root of the current map function is the return statement of the transformation function
                        mapFnIndex = getMapFnIndex(views, prevView.targetFieldFQN);
                    }
                } else {
                    if (!targetFieldFQN && targetPort.field.kind === TypeKind.Array) {
                        // The visiting map function is declaired at the return statement of the current map function
                        targetFieldFQN = prevView.targetFieldFQN;
                        mapFnIndex = getMapFnIndex(views, prevView.targetFieldFQN);
                    } else {
                        targetFieldFQN = `${prevView.targetFieldFQN}.${targetFieldFQN}`;
                    }
                }
            }
            if (!!prevView.sourceFieldFQN) {
                sourceFieldFQN = `${prevView.sourceFieldFQN}${sourceFieldFQN ? `.${sourceFieldFQN}` : ''}`;
            }
        } else {
            // Navigating into the root map function
            if (!targetFieldFQN && targetPort.field.kind === TypeKind.Array) {
                // The visiting map function is the return statement of the transformation function
                mapFnIndex = 0;
            }
        }

        const newView: View = { targetFieldFQN, sourceFieldFQN, sourceNodeType, label, mapFnIndex };

        if (prevViewSubMappingInfo) {
            const newViewSubMappingInfo = {
                ...prevViewSubMappingInfo,
                focusedOnSubMappingRoot: false,
                mapFnIndex: prevViewSubMappingInfo.mapFnIndex !== undefined ? prevViewSubMappingInfo.mapFnIndex + 1 : 0
            };
            newView.subMappingInfo = newViewSubMappingInfo;
        }

        addView(newView);
    }

    const deleteLink = async () => {
        setDeleteInProgress(true);
        await node.deleteLink();
        setDeleteInProgress(false);
    }

    const onClickEdit = () => {
        const targetPort = node.targetPort;
        setExprBarFocusedPort(targetPort as InputOutputPortModel);
    };

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
                            tooltip="Map array elements"
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
                            <>
                                {hasElementAccessExpr && (<Button
                                    appearance="icon"
                                    onClick={onClickEdit}
                                    data-testid={`link-connector-indexing-${node?.value}`}
                                    tooltip='indexing'
                                >
                                    {`[ ${((node.parentNode as PropertyAssignment)
                                        .getInitializer() as ElementAccessExpression)
                                        .getArgumentExpression().getText()} ]`}
                                </Button>)}
                                <Button
                                    appearance="icon"
                                    tooltip="Delete"
                                    onClick={deleteLink} data-testid={`delete-query-${node?.targetFieldFQN}`}
                                >
                                    <Codicon name="trash" iconSx={{ color: "var(--vscode-errorForeground)" }} />
                                </Button>
                            </>

                        )}
                        <DataMapperPortWidget engine={engine} port={outPort} />
                    </div>
                </div>
            )}
        </>
    ));
}
