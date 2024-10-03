/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import React from 'react';
import { PullUpButton } from '../PullUpButton/PullUPButton';

const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: flex-end;
    flex-grow: 1;
`;

interface OptionPopupProps {
    options: string[];
    selectedOptions: string[];
    hideDelete?: boolean;
    onOptionChange: (options: string[]) => void;
    onDeleteResource?: () => void;
    onViewSwagger?: () => void;
}

export function OptionPopup(props: OptionPopupProps) {
    const { options, selectedOptions, onOptionChange, hideDelete, onViewSwagger } = props;

    const handleOnDelete = () => {
        if (props.onDeleteResource) {
            props.onDeleteResource();
        }
    };

    const handleViewSwagger = () => {
        onViewSwagger();
    };

    return (
        <>
            <ButtonWrapper>
                <PullUpButton options={options} selectedOptions={selectedOptions} onOptionChange={onOptionChange}>
                    <Button appearance="primary">
                        More Options
                        <Codicon sx={{marginLeft: 5, marginTop: 1}} name="chevron-down" />
                    </Button>
                </PullUpButton>
                {!hideDelete && <Button buttonSx={{background: "var(--vscode-errorForeground)"}} appearance="primary" onClick={handleOnDelete}> Delete Resource </Button>}
                <Button sx={{ marginTop: 2 }} appearance="icon" onClick={handleViewSwagger}> 
                    <Codicon name="eye" />
                </Button>
            </ButtonWrapper>
        </>
    );
}
