/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import Button from '@mui/material/Button';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { useStyles } from './styles';

interface NodeCollapserProps {
    collapsedMode: boolean;
    setIsCollapsedMode: (collapsedMode: boolean) => void;
}

export function NodeCollapser(props: NodeCollapserProps) {
    const { collapsedMode, setIsCollapsedMode } = props;
    const styles = useStyles();

    return (
        <Button
            variant='outlined'
            size='small'
            className={styles.button}
            onClick={() => setIsCollapsedMode(!collapsedMode)}
            startIcon={collapsedMode ? <UnfoldMoreIcon /> : <UnfoldLessIcon />}
        >
            {collapsedMode ? 'Expand' : 'Collapse'}
        </Button>
    );
}
