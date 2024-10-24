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

import { IDMType, TypeKind } from '@wso2-enterprise/ballerina-core';
import { Button, Codicon, ProgressRing } from '@wso2-enterprise/ui-toolkit';
import { css } from '@emotion/css';
import classNames from "classnames";

import { DiagnosticWidget } from '../Diagnostic/DiagnosticWidget';
import { InputOutputPortModel } from '../Port';
import { ExpressionLabelModel } from './ExpressionLabelModel';
import { isSourcePortArray, isTargetPortArray } from '../utils/link-utils';
import { DataMapperLinkModel } from '../Link';
import { useDMCollapsedFieldsStore } from '../../../store/store';
import { CodeActionWidget } from '../CodeAction/CodeAction';

export interface ExpressionLabelWidgetProps {
    model: ExpressionLabelModel;
}

export const useStyles = () => ({
    container: css({
        width: '100%',
        backgroundColor: "var(--vscode-sideBar-background)",
        padding: "2px",
        borderRadius: "6px",
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
    iconWrapper: css({
        height: '22px',
        width: '22px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }),
    codeIconButton: css({
        color: 'var(--vscode-checkbox-border)',
    }),
    deleteIconButton: css({
        color: 'var(--vscode-checkbox-border)',
    }),
    separator: css({
        height: 'fit-content',
        width: '1px',
        backgroundColor: 'var(--vscode-editor-lineHighlightBorder)',
    }),
    rightBorder: css({
        borderRightWidth: '2px',
        borderColor: 'var(--vscode-pickerGroup-border)',
    }),
    loadingContainer: css({
        padding: '10px',
    }),
});

export enum LinkState {
    TemporaryLink,
    LinkSelected,
    LinkNotSelected
}

export enum ArrayMappingType {
    ArrayToArray,
    ArrayToSingleton
}

// now we can render all what we want in the label
export function ExpressionLabelWidget(props: ExpressionLabelWidgetProps) {
    const [linkStatus, setLinkStatus] = useState<LinkState>(LinkState.LinkNotSelected);
    const [arrayMappingType, setArrayMappingType] = React.useState<ArrayMappingType>(undefined);
    const [deleteInProgress, setDeleteInProgress] = useState(false);

    const collapsedFieldsStore = useDMCollapsedFieldsStore();

    const classes = useStyles();
    const { field, link, value, valueNode, context, deleteLink } = props.model;
    const diagnostic = link && link.hasError() ? link.diagnostics[0] || link.diagnostics[0] : null;

    useEffect(() => {
        if (link) {
            link.registerListener({
                selectionChanged(event) {
                    setLinkStatus(event.isSelected ? LinkState.LinkSelected : LinkState.LinkNotSelected);
                },
            });
            const isSourceArray = isSourcePortArray(source);
            const isTargetArray = isTargetPortArray(target);
            const mappingType = getArrayMappingType(isSourceArray, isTargetArray);
            setArrayMappingType(mappingType);
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
        // const range = getEditorLineAndColumn(field);
        // context.goToSource(range);
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
                <div className={classes.separator}/>
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

    const onClickMapViaArrayFn = async () => {
        if (target instanceof InputOutputPortModel) {
            const targetPortField = target.field;

            if (targetPortField.kind === TypeKind.Array && targetPortField?.memberType) {
                // await applyArrayFunction(link, targetPortField.memberType);
            }
        }
    };

    const applyArrayFunction = async (linkModel: DataMapperLinkModel, targetType: IDMType) => {
    };

    const codeActions = [];
    if (arrayMappingType === ArrayMappingType.ArrayToArray) {
        codeActions.push({
            title: "Map with array function",
            onClick: onClickMapViaArrayFn
        });
    } else if (arrayMappingType === ArrayMappingType.ArrayToSingleton) {
        // TODO: Add impl
    }

    if (codeActions.length > 0) {
        elements.push(<div className={classes.separator}/>);
        elements.push(
            <CodeActionWidget
                key={`expression-label-code-action-${value}`}
                codeActions={codeActions}
                btnSx={{ margin: "0 2px" }}
            />
        );
    }

    if (diagnostic) {
        elements.push(<div className={classes.separator}/>);
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

    const source = link?.getSourcePort();
    const target = link?.getTargetPort();

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

    return linkStatus === LinkState.TemporaryLink
        ? (
            <div
                className={classNames(
                    classes.container
                )}
            >
                <div className={classNames(classes.element, classes.loadingContainer)}>
                    {loadingScreen}
                </div>
            </div>
        ) : (
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

export function getArrayMappingType(isSourceArray: boolean, isTargetArray: boolean): ArrayMappingType {
	let mappingType: ArrayMappingType;
	if (isSourceArray && isTargetArray) {
		mappingType = ArrayMappingType.ArrayToArray;
	} else if (isSourceArray && !isTargetArray) {
		mappingType = ArrayMappingType.ArrayToSingleton;
	}

	return mappingType;
}
