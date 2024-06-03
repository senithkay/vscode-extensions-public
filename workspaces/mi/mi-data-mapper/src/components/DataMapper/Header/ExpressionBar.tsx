/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';

import { Icon, TextField } from '@wso2-enterprise/ui-toolkit';

export interface ExpressionBarProps {
}

export default function ExpressionBar() {

    const onChange = () => {
        // TODO
    };

    return (
        <TextField
            sx={{ width: '100%' }}
            disabled={false}
            icon={{
                iconComponent: (
                    <Icon
                        name={"function-icon"}
                        iconSx={{ fontSize: "15px", color: "var(--vscode-input-placeholderForeground)" }}
                    />
                ),
                position: "start"
            }}
            value={""}
            onTextChange={onChange}
        />
    );
}
