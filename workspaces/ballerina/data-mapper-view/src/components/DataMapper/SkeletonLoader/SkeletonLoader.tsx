/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import { css, keyframes } from "@emotion/css";
import styled from '@emotion/styled';

const skeletonPulse = keyframes`
    0% { opacity: 0.6; }
    50% { opacity: 0.8; }
    100% { opacity: 0.6; }
`;

const classes = {
    loadingContainer: css({
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box'
    }),
    skeletonNode: css({
        width: '320px',
        minHeight: '320px',
        background: 'var(--vscode-sideBar-background)',
        borderRadius: '2px',
        border: '1px solid var(--vscode-welcomePage-tileBorder)',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        animation: `${skeletonPulse} 1.5s ease-in-out infinite`,
        gap: '24px',
    }),
    skeletonHeader: css({
        height: '36px',
        backgroundColor: 'var(--vscode-editor-inactiveSelectionBackground)',
        borderRadius: '8px',
        marginBottom: '24px',
        width: '85%',
    }),
    skeletonFieldsContainer: css({
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
    }),
    skeletonField: css({
        height: '24px',
        backgroundColor: 'var(--vscode-editor-inactiveSelectionBackground)',
        borderRadius: '6px',
        width: '60%',
        '&:nth-of-type(2)': {
            width: '50%'
        },
        '&:nth-of-type(3)': {
            width: '70%'
        }
    }),
};

export const Container = styled.div`
    width: 100%;
    height: 100%;
    background-image: radial-gradient(var(--vscode-editor-inactiveSelectionBackground) 10%, transparent 0px);
    background-size: 16px 16px;
    background-color: var(--vscode-editor-background);
`;

interface SkeletonLoaderProps {
    className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className }) => {
    return (
        <Container className={`${classes.loadingContainer} ${className || ''}`}>
            <div className={classes.skeletonNode}>
                <div className={classes.skeletonHeader} />
                <div className={classes.skeletonFieldsContainer}>
                    <div className={classes.skeletonField} />
                    <div className={classes.skeletonField} />
                    <div className={classes.skeletonField} />
                </div>
            </div>
            <div className={classes.skeletonNode}>
                <div className={classes.skeletonHeader} />
                <div className={classes.skeletonFieldsContainer}>
                    <div className={classes.skeletonField} />
                    <div className={classes.skeletonField} />
                    <div className={classes.skeletonField} />
                </div>
            </div>
        </Container>
    );
};
