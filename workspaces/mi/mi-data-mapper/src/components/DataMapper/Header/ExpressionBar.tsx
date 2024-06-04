/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useMemo } from 'react';

import { Icon, TextField } from '@wso2-enterprise/ui-toolkit';
import { Node } from 'ts-morph';

import { useDMExpressionBarStore } from '../../../store/store';

export interface ExpressionBarProps {
}

export default function ExpressionBar() {
    const focusedPort = useDMExpressionBarStore(state => state.focusedPort);

    const { value, disabled } = useMemo(() => {
        let value = "";
        let disabled = false;
    
        if (focusedPort) {
            const focusedNode = focusedPort.typeWithValue.value;
    
            if (Node.isPropertyAssignment(focusedNode)) {
                value = focusedNode.getInitializer()?.getText();
            } else {
                value = focusedNode ? focusedNode.getText() : "";
            }
    
            disabled = focusedPort.isDisabled();
        }
    
        return { value, disabled };
    }, [focusedPort]);

    const onChange = () => {
        // TODO
    };

    return (
        <TextField
            sx={{ width: '100%' }}
            disabled={disabled}
            icon={{
                iconComponent: (
                    <Icon
                        name={"function-icon"}
                        iconSx={{ fontSize: "15px", color: "var(--vscode-input-placeholderForeground)" }}
                    />
                ),
                position: "start"
            }}
            value={value}
            onTextChange={onChange}
        />
    );
}
