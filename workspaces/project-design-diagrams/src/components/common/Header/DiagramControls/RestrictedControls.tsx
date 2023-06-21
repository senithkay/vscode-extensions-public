/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from 'react';
import Button from '@mui/material/Button';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { Views } from '../../../../resources';
import '../styles/styles.css';

interface RestrictedControlsProps {
    previousScreen: Views;
}

export function RestrictedControls(props: RestrictedControlsProps) {
    const { previousScreen } = props;
    const { setCurrentView } = useContext(DiagramContext);

    const goBack = () => {
        setCurrentView(previousScreen);
    }

    return (
        <div>
            <Button
                variant='outlined'
                size='small'
                className={'button'}
                startIcon={<ReplyAllIcon fontSize='small' />}
                onClick={goBack}
            >
                Go Back
            </Button>
        </div>
    );
}
