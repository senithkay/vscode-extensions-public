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

import { Codicon, Item, Menu, MenuItem } from '@wso2-enterprise/ui-toolkit';
import { css } from '@emotion/css';

import { InputOutputPortModel, ValueType } from '../Port';
import { getEditorLineAndColumn, getValueType } from '../utils/common-utils';
import { generateCustomFunction } from '../utils/link-utils';
import { DataMapperLinkModel } from '../Link';
import { buildInputAccessExpr, createSourceForMapping, updateExistingValue } from '../utils/modification-utils';
import { ExpressionLabelModel } from './ExpressionLabelModel';

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

const o2oMenuStyles = {
    backgroundColor: "var(--vscode-quickInput-background)",
    boxShadow: "none",
    padding: "0px",
    border: "1px solid var(--vscode-debugIcon-breakpointDisabledForeground)"
};

const codiconStyles = {
    color: 'var(--vscode-editorLightBulb-foreground)',
    marginRight: '10px'
}

export interface ObjectMappingOptionsWidgetProps {
    model: ExpressionLabelModel;
}

export function ObjectMappingOptionsWidget(props: ObjectMappingOptionsWidgetProps) {
    const classes = useStyles();
    const { link, pendingMappingType, context } = props.model;

    const sourcePort = link.getSourcePort();
    const targetPort = link?.getTargetPort();
    const valueType = getValueType(link);
    const targetPortHasLinks = Object.values(targetPort.links)
        ?.some(link => (link as DataMapperLinkModel)?.isActualLink);

    const isValueModifiable = valueType === ValueType.Default
        || (valueType === ValueType.NonEmpty && !targetPortHasLinks);
    
    const onClickMapDirectly = async () => {
        if (isValueModifiable) {
            await updateExistingValue(sourcePort, targetPort);
        } else {
            await createSourceForMapping(link);
        }
    }

    const onClickMapWithCustomFunction = async () => {
        if (targetPort instanceof InputOutputPortModel && sourcePort instanceof InputOutputPortModel) {

            const inputAccessExpr = buildInputAccessExpr((link.getSourcePort() as InputOutputPortModel).fieldFQN);
            const sourceFile = context.functionST.getSourceFile();
            const customFunction = generateCustomFunction(sourcePort, targetPort, sourceFile);
            const customFunctionDeclaration = sourceFile.addFunction(customFunction);
            const range = getEditorLineAndColumn(customFunctionDeclaration);
            const customFunctionCallExpr = `${customFunction.name}(${inputAccessExpr})`;
          
            if (isValueModifiable) {
                await updateExistingValue(sourcePort, targetPort, customFunctionCallExpr);
            } else {
                await createSourceForMapping(link, customFunctionCallExpr);
            }
            context.goToSource(range);
           
        }
    };

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

    const o2oMenuItems: Item[] = [
        {
            id: "o2o-direct",
            label: getItemElement("o2o-direct", "Map Object Directly"),
            onClick: onClickMapDirectly
        },
        {
            id: "o2o-func",
            label: getItemElement("o2o-func", "Map Objects with Custom Function"),
            onClick: onClickMapWithCustomFunction
        }
    ];

    return (
        <div className={classes.arrayMappingMenu}>
            <Menu sx={o2oMenuStyles}>
                {o2oMenuItems.map((item: Item) =>
                    <MenuItem
                        key={`item ${item.id}`}
                        item={item}
                    />
                )}
            </Menu>
        </div>
    );
}
