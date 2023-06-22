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
    onClick: (visibility: boolean) => void;
    visibility: boolean;
}

export function VisibilityButton(props: ButtonProps) {
    const { onClick, visibility } = props;

    return (
        <Button
            variant='text'
            onClick={() => onClick(!visibility)}
            size='small'
            sx={{
                color: Colors.PRIMARY,
                fontFamily: 'GilmerMedium',
                fontSize: '13px',
                marginLeft: '4px',
                minHeight: 0,
                minWidth: 0,
                padding: '4px 6px',
                textTransform: 'none',
                '&:hover': {
                    backgroundColor: Colors.SECONDARY
                }
            }}
        >
            {visibility ? 'Hide' : 'Show'}
        </Button>
    );
}
