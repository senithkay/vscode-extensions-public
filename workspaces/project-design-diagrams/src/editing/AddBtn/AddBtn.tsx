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
import Fab from '@mui/material/Fab';
import styled from '@emotion/styled';
import { Colors } from '../../resources';

const Container = styled.div`
    position: absolute;
    bottom: 15px;
    left: 15px;
`;

export function AddButton(props: { onClick: () => void }) {
    const { onClick } = props;

    return (
        <Container onClick={onClick}>
            <Fab
                aria-label='add'
                variant='extended'
                sx={{
                    backgroundColor: Colors.PRIMARY,
                    borderRadius: '2px',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: '#4958ba'
                    }
                }}
            >
                <AddIcon sx={{ marginRight: '5px' }} />
                Component
            </Fab>
        </Container>
    )
}
