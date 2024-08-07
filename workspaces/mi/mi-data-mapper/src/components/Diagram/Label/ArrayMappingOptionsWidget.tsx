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

import { DMType, TypeKind } from '@wso2-enterprise/mi-core';
import { Item, Menu, MenuItem } from '@wso2-enterprise/ui-toolkit';
import { css } from '@emotion/css';
import { Node } from "ts-morph";

import { InputOutputPortModel } from '../Port';
import { isInputAccessExpr } from '../utils/common-utils';
import { generateArrayToArrayMappingWithFn } from '../utils/link-utils';
import { DataMapperLinkModel } from '../Link';
import { DataMapperContext } from '../../../utils/DataMapperContext/DataMapperContext';

export const useStyles = () => ({
    arrayMappingMenu: css({
        backgroundColor: "var(--vscode-sideBar-background)",
        pointerEvents: 'auto'
    })
});

export interface ArrayMappingOptionsWidgetProps {
    link: DataMapperLinkModel;
    context: DataMapperContext;
    setIsConnectingArrays: (isConnectingArrays: boolean) => void;
}

export function ArrayMappingOptionsWidget(props: ArrayMappingOptionsWidgetProps) {
    const classes = useStyles();
    const { link, context, setIsConnectingArrays } = props;

    const onClickMapViaArrayFn = async () => {
        const target = link?.getTargetPort();
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

            const mapFnSrc = generateArrayToArrayMappingWithFn(linkModelValue.getText(), targetType, isSourceOptional);

            const updatedTargetExpr = targetExpr.replaceWithText(mapFnSrc);
            setIsConnectingArrays(false);
            await context.applyModifications(updatedTargetExpr.getSourceFile().getFullText());
        }
    };

    const items: Item[] = [
        {id: "a2a-direct", label: <>Map Input Array to Output Array</>, onClick: () => onClickMapViaArrayFn(), disabled: false}, 
        {id: "a2a-inner", label: <>Further Process Array to Array Mapping</>, onClick: () => {console.log("Item Selected")}, disabled: false},
        {id: "discard", label: <>Discard</>, onClick: () => {console.log("Item Selected")}, disabled: false}
    ];

    return (
        <div className={classes.arrayMappingMenu}>
            <Menu sx={{ backgroundColor: "var(--vscode-sideBar-background)" }}> 
                {items.map((item: Item) => 
                    <MenuItem
                        key={`item ${item.id}`}
                        item={item}
                        onClick={() => {console.log(`Clicked Item ${item.id}`)}}
                    />
                )}
            </Menu>
        </div>
    );
}
