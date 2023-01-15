/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
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
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import Fab from '@mui/material/Fab';
import styled from '@emotion/styled';
import { Colors } from '../../resources';
import { SxProps } from '@mui/material';

const Container = styled.div`
    position: ${(props: {letFloat: boolean}) => props.letFloat ? 'relative' : 'absolute'};
    bottom: 15px;
    left: 15px;
`;

const ButtonStyles: SxProps = {
    backgroundColor: Colors.PRIMARY,
    borderRadius: '2px',
    color: 'white',
    fontSize: '12px',
    marginInline: '2.5px',
    '&:hover': {
        backgroundColor: '#4958ba'
    }
};

interface ControlsProps {
    onComponentAddClick: () => void;
    isChoreoProject?: boolean;
    float?: boolean;
}

export function ControlsLayer(props: ControlsProps) {
    const { onComponentAddClick, isChoreoProject, float } = props;

    return (
        <Container letFloat={float}>
            <Fab
                aria-label='add'
                variant='extended'
                size='small'
                onClick={onComponentAddClick}
                sx={ButtonStyles}
            >
                <AddIcon sx={{ marginRight: '5px' }} />
                Component
            </Fab>

            {isChoreoProject &&
                <Fab
                    aria-label='overview'
                    variant='extended'
                    size='small'
                    sx={ButtonStyles}
                >
                    <AccountTreeIcon sx={{ marginRight: '5px' }} />
                    Overview
                </Fab>
            }
        </Container>
    )
}
