/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import React from 'react';
const background = require('../../resources/assets/PatternBg.svg') as string;
// import Fab from '@mui/material/Fab';
// import SearchIcon from '@mui/icons-material/Search';
// import { useStyles } from './style';

const messageBox = css`
  color: #6b6b6b;
  font-family: 'GilmerRegular';
  font-size: 16px;
  padding: 10px;
`;

// Define the styled container component
const Container = styled.div`
  align-items: center;
  background-image: url(${background});
  background-repeat: repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100vh;
  width: 100vw;
`;

export interface PromptScreenProps {
    userMessage: string;
    showProblemPanel?: (() => void) | undefined;
}

export function PromptScreen(props: PromptScreenProps) {
    const { userMessage } = props;
    // const styles = useStyles();

    return (
        <Container>
            <h3 className={messageBox}>{userMessage}</h3>
            {/* FIXME: If the problem panel is needed we need to implement Fab in UI toolkit */}
            {/* {showProblemPanel &&
                <Fab
                    aria-label='add'
                    className={styles.button}
                    id={'add-component-btn'}
                    onClick={showProblemPanel}
                    size='small'
                    variant='extended'
                >
                    <SearchIcon sx={{ marginRight: '5px' }} />
                    View Diagnostics
                </Fab>
            } */}
        </Container>
    );
}
