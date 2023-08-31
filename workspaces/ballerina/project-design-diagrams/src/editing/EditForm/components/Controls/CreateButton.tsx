/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import Button from '@mui/material/Button';
import { Colors } from '../../../../resources';

interface ButtonProps {
    label: string;
    color: string;
    disabled?: boolean;
    testId?: string;
    onClick: () => void;
}

export function CreateButton(props: ButtonProps) {
    const { label, color, testId, disabled, onClick } = props;

    return (
        <Button
            data-testid={testId}
            disabled={disabled || false}
            onClick={onClick}
            size='medium'
            variant='contained'
            sx={{
                backgroundColor: color,
                color: color === Colors.PRIMARY ? 'white' : Colors.PRIMARY,
                marginRight: '10px',
                '&:hover': {
                    backgroundColor: color
                }
            }}
        >
            {label}
        </Button>
    );
}
