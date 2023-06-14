/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
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
