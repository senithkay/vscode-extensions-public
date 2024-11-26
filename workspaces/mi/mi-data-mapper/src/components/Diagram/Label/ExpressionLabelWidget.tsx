/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { MouseEvent, ReactNode, useEffect, useState } from 'react';

import { DMType, TypeKind } from '@wso2-enterprise/mi-core';
import { Button, Codicon, ProgressRing } from '@wso2-enterprise/ui-toolkit';
import { css } from '@emotion/css';
import classNames from "classnames";
import { Node } from "ts-morph";

import { DiagnosticWidget } from '../Diagnostic/DiagnosticWidget';
import { InputOutputPortModel, MappingType } from '../Port';
import { getMapFnIndex, getMapFnViewLabel, getMappingType, isInputAccessExpr } from '../utils/common-utils';
import { ExpressionLabelModel } from './ExpressionLabelModel';
import { generateArrayMapFunction, isSourcePortArray, isTargetPortArray } from '../utils/link-utils';
import { DataMapperLinkModel } from '../Link';
import { useDMCollapsedFieldsStore, useDMExpressionBarStore } from '../../../store/store';
import { CodeActionWidget } from '../CodeAction/CodeAction';
import { SUB_MAPPING_INPUT_SOURCE_PORT_PREFIX } from '../utils/constants';
import { SubMappingInfo, View } from '../../../components/DataMapper/Views/DataMapperView';
import { getSourceNodeType } from '../utils/node-utils';

export const useStyles = () => ({
    container: css({
        width: '100%',
        backgroundColor: "var(--vscode-sideBar-background)",
        padding: "2px",
        borderRadius: "6px",
        border: "1px solid var(--vscode-welcomePage-tileBorder)",
        display: "flex",
        color: "var(--vscode-checkbox-border)",
        alignItems: "center",
        "& > vscode-button > *": {
            margin: "0 2px"
        }
    }),
    containerHidden: css({
        visibility: 'hidden',
    }),
    btnContainer: css({
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        "& > *": {
            margin: "0 2px"
        }
    }),
    element: css({
        backgroundColor: 'var(--vscode-input-background)',
        padding: '10px',
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
    separator: css({
        height: 'fit-content',
        width: '1px',
        backgroundColor: 'var(--vscode-editor-lineHighlightBorder)',
    }),
    loadingContainer: css({
        padding: '10px',
    })
});

export enum LinkState {
    TemporaryLink,
    LinkSelected,
    LinkNotSelected
}

export interface ExpressionLabelWidgetProps {
    model: ExpressionLabelModel;
}

// now we can render all what we want in the label
export function ExpressionLabelWidget(props: ExpressionLabelWidgetProps) {
    const [linkStatus, setLinkStatus] = useState<LinkState>(LinkState.LinkNotSelected);
    const [mappingType, setMappingType] = React.useState<MappingType>(MappingType.Default);
    const [deleteInProgress, setDeleteInProgress] = useState(false);

    const collapsedFieldsStore = useDMCollapsedFieldsStore();
    const setExprBarFocusedPort = useDMExpressionBarStore(state => state.setFocusedPort);

    const classes = useStyles();
    const { link, value, valueNode, context, deleteLink } = props.model;
    const { addView, views } = context;

    const source = link?.getSourcePort() as InputOutputPortModel;
    const target = link?.getTargetPort() as InputOutputPortModel;
    const diagnostic = link && link.hasError() ? link.diagnostics[0] || link.diagnostics[0] : null;

    useEffect(() => {
        if (link && link.isActualLink) {
            link.registerListener({
                selectionChanged(event) {
                    setLinkStatus(event.isSelected ? LinkState.LinkSelected : LinkState.LinkNotSelected);
                },
            });
            
            const mappingType = getMappingType(source, target);
            setMappingType(mappingType);
        } else {
            setLinkStatus(LinkState.TemporaryLink);
        }
    }, [props.model]);

    const onClickDelete = (evt?: MouseEvent<HTMLDivElement>) => {
        if (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }
        setDeleteInProgress(true);
        if (deleteLink) {
            deleteLink();
        }
    };

    const onClickEdit = (evt?: MouseEvent<HTMLDivElement>) => {
        const targetPort = props.model.link.getTargetPort();
        setExprBarFocusedPort(targetPort as InputOutputPortModel);
    };

    const loadingScreen = (
        <ProgressRing sx={{ height: '16px', width: '16px' }} />
    );

    const elements: ReactNode[] = [
        (
            <div
                key={`expression-label-edit-${value}`}
                className={classes.btnContainer}
            >
                <Button
                    appearance="icon"
                    onClick={onClickEdit}
                    data-testid={`expression-label-edit`}
                    sx={{ userSelect: "none", pointerEvents: "auto" }}
                >
                    <Codicon name="code" iconSx={{ color: "var(--vscode-input-placeholderForeground)" }} />
                </Button>
                <div className={classes.separator} />
                {deleteInProgress ? (
                    loadingScreen
                ) : (
                    <Button
                        appearance="icon"
                        onClick={onClickDelete}
                        data-testid={`expression-label-delete`}
                        sx={{ userSelect: "none", pointerEvents: "auto" }}
                    >
                        <Codicon name="trash" iconSx={{ color: "var(--vscode-errorForeground)" }} />
                    </Button>
                )}
            </div>
        ),
    ];

    const expandArrayFn = () => {
        let label = getMapFnViewLabel(target, views);
        let targetFieldFQN = target.fieldFQN;
        const isSourcePortSubMapping = source.portName.startsWith(SUB_MAPPING_INPUT_SOURCE_PORT_PREFIX);

        let sourceFieldFQN = isSourcePortSubMapping
            ? source.fieldFQN
            : source.fieldFQN.split('.').slice(1).join('.');
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
                    if (!targetFieldFQN && target.field.kind === TypeKind.Array) {
                        // The root of the current map function is the return statement of the transformation function
                        mapFnIndex = getMapFnIndex(views, prevView.targetFieldFQN);
                    }
                } else {
                    if (!targetFieldFQN && target.field.kind === TypeKind.Array) {
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
            if (!targetFieldFQN && target.field.kind === TypeKind.Array) {
                // The visiting map function is the return statement of the transformation function
                mapFnIndex = 0;
            }
        }

        const sourceNodeType = getSourceNodeType(source);

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

    const onClickMapViaArrayFn = async () => {
        if (target instanceof InputOutputPortModel) {
            const targetPortField = target.field;

            if (targetPortField.kind === TypeKind.Array && targetPortField?.memberType) {
                await applyArrayFunction(link, targetPortField.memberType);
            }
        }
    };

    const applyArrayFunction = async (linkModel: DataMapperLinkModel, targetType: DMType) => {
        if (linkModel.value && (isInputAccessExpr(linkModel.value) || Node.isIdentifier(linkModel.value))) {

            let isSourceOptional = false;
            const linkModelValue = linkModel.value;
            const sourcePort = linkModel.getSourcePort();
            const targetPort = linkModel.getTargetPort();

            let targetExpr: Node = linkModelValue;
            if (sourcePort instanceof InputOutputPortModel && sourcePort.field.optional) {
                isSourceOptional = true;
            }
            if (targetPort instanceof InputOutputPortModel) {
                const expr = targetPort.typeWithValue?.value;
                if (Node.isPropertyAssignment(expr)) {
                    targetExpr = expr.getInitializer();
                } else {
                    targetExpr = expr;
                }
            }

            const mapFnSrc = generateArrayMapFunction(linkModelValue.getText(), targetType, isSourceOptional);

            expandArrayFn();

            const updatedTargetExpr = targetExpr.replaceWithText(mapFnSrc);
            await context.applyModifications(updatedTargetExpr.getSourceFile().getFullText());
        }
    };

    const codeActions = [];
    if (mappingType === MappingType.ArrayToArray) {
        codeActions.push({
            title: "Map array elements individually",
            onClick: onClickMapViaArrayFn
        });
    } else if (mappingType === MappingType.ArrayToSingleton) {
        // TODO: Add impl
    }

    if (codeActions.length > 0) {
        elements.push(<div className={classes.separator} />);
        elements.push(
            <CodeActionWidget
                key={`expression-label-code-action-${value}`}
                codeActions={codeActions}
                btnSx={{ margin: "0 2px" }}
            />
        );
    }

    if (diagnostic) {
        elements.push(<div className={classes.separator} />);
        elements.push(
            <DiagnosticWidget
                key={`expression-label-diagnostic-${value}`}
                diagnostic={diagnostic}
                value={value}
                onClick={onClickEdit}
                isLabelElement={true}
                btnSx={{ margin: "0 2px" }}
            />
        );
    }

    let isSourceCollapsed = false;
    let isTargetCollapsed = false;
    const collapsedFields = collapsedFieldsStore.collapsedFields;

    if (source instanceof InputOutputPortModel) {
        if (source?.parentId) {
            const fieldName = source.field.fieldName;
            isSourceCollapsed = collapsedFields?.includes(`${source.parentId}.${fieldName}`)
        } else {
            isSourceCollapsed = collapsedFields?.includes(source.portName)
        }
    }

    if (target instanceof InputOutputPortModel) {
        if (target?.parentId) {
            const fieldName = target.field.fieldName;
            isTargetCollapsed = collapsedFields?.includes(`${target.parentId}.${fieldName}`)
        } else {
            isTargetCollapsed = collapsedFields?.includes(target.portName)
        }
    }

    if (valueNode && isSourceCollapsed && isTargetCollapsed) {
        // for direct links, disable link widgets if both sides are collapsed
        return null
    } else if (!valueNode && (isSourceCollapsed || isTargetCollapsed)) {
        // for links with intermediary nodes,
        // disable link widget if either source or target port is collapsed
        return null;
    }


    if (linkStatus === LinkState.TemporaryLink) {
        return (
            <div className={classNames(classes.container, classes.element, classes.loadingContainer)}>
                {loadingScreen}
            </div>
        );
    }

    return (
        <div
            data-testid={`expression-label-for-${link?.getSourcePort()?.getName()}-to-${link?.getTargetPort()?.getName()}`}
            className={classNames(
                classes.container,
                linkStatus === LinkState.LinkNotSelected && !deleteInProgress && classes.containerHidden
            )}
        >
            {elements}
        </div>
    );
}
