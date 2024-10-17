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
import { PullUpButton } from '../PullUpButton/PullUPButton';

const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: flex-start;
    flex-grow: 1;
`;

interface OptionPopupProps {
    options: string[];
    selectedOptions: string[];
    onOptionChange: (options: string[]) => void;
    onSwiychToReadOnly?: () => void;
}

export function OptionPopup(props: OptionPopupProps) {
    const { options, selectedOptions, onOptionChange } = props;


    return (
        <>
            <ButtonWrapper>
                <PullUpButton closeOnSelect={false} options={options} selectedOptions={selectedOptions} onOptionChange={onOptionChange}>
                    <Button appearance="primary">
                        More Options
                        <Codicon sx={{marginLeft: 5, marginTop: 1}} name="chevron-down" />
                    </Button>
                </PullUpButton>
            </ButtonWrapper>
        </>
    );
}
