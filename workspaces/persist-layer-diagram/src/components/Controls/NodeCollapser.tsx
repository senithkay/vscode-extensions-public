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
import Fab from '@mui/material/Fab';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { SxProps } from '@mui/material/styles';
import { Colors } from '../../resources';

const ButtonStyles: SxProps = {
    backgroundColor: Colors.PRIMARY,
    borderRadius: '5px',
    color: 'white',
    fontSize: '12px',
    left: '10px',
    paddingInline: '10px',
    position: 'absolute',
    width: '120px',
    top: '10px',
    '&:hover': {
        backgroundColor: '#4958ba'
    }
};

interface NodeCollapserProps {
    collapsedMode: boolean;
    setIsCollapsedMode: (collapsedMode: boolean) => void;
}

export function NodeCollapser(props: NodeCollapserProps) {
    const { collapsedMode, setIsCollapsedMode } = props;

    return (
        <Fab
            id={'collapse-nodes-btn'}
            variant='extended'
            size='small'
            onClick={() => setIsCollapsedMode(!collapsedMode)}
            sx={ButtonStyles}
        >
            {collapsedMode ?
                <>
                    <UnfoldLessIcon sx={{ marginRight: '5px' }} /> Collapse
                </> :
                <>
                    <UnfoldMoreIcon sx={{ marginRight: '5px' }} /> Expand
                </>
            }
        </Fab>
    );
}
