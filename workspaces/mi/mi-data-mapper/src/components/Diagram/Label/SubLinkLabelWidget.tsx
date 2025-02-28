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
import { getMappingType, isInputAccessExpr } from '../utils/common-utils';
import { ExpressionLabelModel } from './ExpressionLabelModel';
import { generateArrayMapFunction, isSourcePortArray, isTargetPortArray } from '../utils/link-utils';
import { DataMapperLinkModel } from '../Link';
import { useDMCollapsedFieldsStore, useDMExpressionBarStore } from '../../../store/store';
import { CodeActionWidget } from '../CodeAction/CodeAction';

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
    loadingContainer: css({
        padding: '10px',
    })
});

export enum LinkState {
    TemporaryLink,
    LinkSelected,
    LinkNotSelected
}

export interface SubLinkLabelWidgetProps {
    model: ExpressionLabelModel;
}

// now we can render all what we want in the label
export function SubLinkLabelWidget(props: SubLinkLabelWidgetProps) {
    const [linkStatus, setLinkStatus] = useState<LinkState>(LinkState.LinkNotSelected);
    const [deleteInProgress, setDeleteInProgress] = useState(false);

    const isCollapsedField = useDMCollapsedFieldsStore(state => state.isCollapsedField);
    
    const classes = useStyles();
    const { link, value, valueNode, context, deleteLink } = props.model;
    const source = link?.getSourcePort();
    const target = link?.getTargetPort();
    
    useEffect(() => {
        if (link && link.isActualLink) {
            link.registerListener({
                selectionChanged(event) {
                    setLinkStatus(event.isSelected ? LinkState.LinkSelected : LinkState.LinkNotSelected);
                },
            });
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


    const loadingScreen = (
        <ProgressRing sx={{ height: '16px', width: '16px' }} />
    );

    const elements: ReactNode[] = [
        (
            <div
                key={`sub-link-label-edit-${value}`}
                className={classes.btnContainer}
            >
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
        )
    ];

   
    let isSourceCollapsed = false;
    let isTargetCollapsed = false;

    if (source instanceof InputOutputPortModel) {
        if (source?.parentId) {
            const fieldName = source.field.fieldName;
            isSourceCollapsed = isCollapsedField(`${source.parentId}.${fieldName}`, source.field.kind)
        } else {
            isSourceCollapsed = isCollapsedField(source.portName, source.field.kind)
        }
    }

    if (target instanceof InputOutputPortModel) {
        if (target?.parentId) {
            const fieldName = target.field.fieldName;
            isTargetCollapsed = isCollapsedField(`${target.parentId}.${fieldName}`, target.field.kind);
        } else {
            isTargetCollapsed = isCollapsedField(target.portName, target.field.kind);
        }
    }

const bothCollapsed = isSourceCollapsed && isTargetCollapsed;
const eitherCollapsed = isSourceCollapsed || isTargetCollapsed;

if ((valueNode && bothCollapsed) || (!valueNode && eitherCollapsed)) {
    // Disable link widgets based on collapse states
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
            data-testid={`sub-link-label-for-${link?.getSourcePort()?.getName()}-to-${link?.getTargetPort()?.getName()}`}
            className={classNames(
                classes.container,
                linkStatus === LinkState.LinkNotSelected && !deleteInProgress && classes.containerHidden
            )}
        >
            {elements}
        </div>
    );
}
