/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from 'react';

import { TypeKind } from '@wso2-enterprise/mi-core';
import { Codicon, Item, Menu, MenuItem } from '@wso2-enterprise/ui-toolkit';
import { css } from '@emotion/css';

import { InputOutputPortModel, MappingType, ValueType } from '../Port';
import { genArrayElementAccessSuffix, getMapFnIndex, getMapFnViewLabel, getValueType } from '../utils/common-utils';
import { generateArrayMapFunction } from '../utils/link-utils';
import { DataMapperLinkModel } from '../Link';
import { buildInputAccessExpr, createSourceForMapping, updateExistingValue } from '../utils/modification-utils';
import { ExpressionLabelModel } from './ExpressionLabelModel';
import { expandArrayFn } from '../utils/common-utils';

export const useStyles = () => ({
    arrayMappingMenu: css({
        pointerEvents: 'auto'
    }),
    itemContainer: css({
        display: 'flex',
        width: '100%',
        alignItems: 'center'
    }),
});

const a2aMenuStyles = {
    backgroundColor: "var(--vscode-quickInput-background)",
    boxShadow: "none",
    padding: "0px",
    border: "1px solid var(--vscode-debugIcon-breakpointDisabledForeground)"
};

const codiconStyles = {
    color: 'var(--vscode-editorLightBulb-foreground)',
    marginRight: '10px'
}

export interface ArrayMappingOptionsWidgetProps {
    model: ExpressionLabelModel;
}

export function ArrayMappingOptionsWidget(props: ArrayMappingOptionsWidgetProps) {
    const classes = useStyles();
    const { link, pendingMappingType, context } = props.model;

    const sourcePort = link.getSourcePort();
    const targetPort = link?.getTargetPort();
    const valueType = getValueType(link);
    const targetPortHasLinks = Object.values(targetPort.links)
        ?.some(link => (link as DataMapperLinkModel)?.isActualLink);

    const isValueModifiable = valueType === ValueType.Default
        || (valueType === ValueType.NonEmpty && !targetPortHasLinks);
    
    const onClickMapArrays = async () => {
        if (isValueModifiable) {
            await updateExistingValue(sourcePort, targetPort);
        } else {
            await createSourceForMapping(link);
        }
    }

    const onClickMapIndividualElements = async () => {
        if (targetPort instanceof InputOutputPortModel) {
            const targetPortField = targetPort.field;

            if (targetPortField.kind === TypeKind.Array && targetPortField?.memberType) {
                const inputAccessExpr = buildInputAccessExpr((link.getSourcePort() as InputOutputPortModel).fieldFQN);
                let isSourceOptional = sourcePort instanceof InputOutputPortModel && sourcePort.field.optional;
                const mapFnSrc = generateArrayMapFunction(inputAccessExpr, targetPortField.memberType, isSourceOptional);

               expandArrayFn(sourcePort as InputOutputPortModel, targetPort as InputOutputPortModel, context);

                if (isValueModifiable) {
                    await updateExistingValue(sourcePort, targetPort, mapFnSrc);
                } else {
                    await createSourceForMapping(link, mapFnSrc);
                }
            }
        }
    };

    const onClickMapArraysAccessSingleton = async () => {
        if (isValueModifiable) {
            await updateExistingValue(sourcePort, targetPort, undefined, genArrayElementAccessSuffix(sourcePort, targetPort));
        } else {
            await createSourceForMapping(link, undefined, genArrayElementAccessSuffix(sourcePort, targetPort));
        }
    }

    const getItemElement = (id: string, label: string) => {
        return (
            <div
                className={classes.itemContainer}
                key={id}
            >
                <Codicon name="lightbulb" sx={codiconStyles} />
                {label}
            </div>
        );
    }

    const a2aMenuItems: Item[] = [
        {
            id: "a2a-direct",
            label: getItemElement("a2a-direct", "Map Input Array to Output Array"),
            onClick: onClickMapArrays
        },
        {
            id: "a2a-inner",
            label: getItemElement("a2a-inner", "Map Array Elements Individually"),
            onClick: onClickMapIndividualElements
        }
    ];

    const a2sMenuItems: Item[] = [
        {
            id: "a2s-direct",
            label: getItemElement("a2s-direct", "Access Singleton"),
            onClick: onClickMapArraysAccessSingleton
        }
    ];

    const menuItems = pendingMappingType === MappingType.ArrayToArray ? a2aMenuItems : a2sMenuItems;

    return (
        <div className={classes.arrayMappingMenu}>
            <Menu sx={a2aMenuStyles}>
                {menuItems.map((item: Item) =>
                    <MenuItem
                        key={`item ${item.id}`}
                        item={item}
                    />
                )}
            </Menu>
        </div>
    );
}
