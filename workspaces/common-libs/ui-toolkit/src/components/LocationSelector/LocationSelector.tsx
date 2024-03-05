/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import styled from '@emotion/styled';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { RequiredFormInput } from '../Commons/RequiredInput';

export interface FileSelectorProps {
    id?: string;
	label: string;
    selectedFile?: string;
    onSelect: () => void;
	selectionText?: string;
    btnText?: string;
	required?: boolean;
	sx?: any;
}

const BrowseBtn = styled(VSCodeButton)`
    width: fit-content;
    padding: 5px;
`;

interface ContainerProps {
	sx?: any;
}

const Container = styled.div<ContainerProps>`
	display: flex;
    flex-direction: column;
	${(props: ContainerProps) => props.sx};
`;

const LabelContainer = styled.div<ContainerProps>`
    display: flex;
    flex-direction: row;
    margin-bottom: 4px;
`;

export const LocationSelector: React.FC<FileSelectorProps> = (props: FileSelectorProps) => {
    const { id, label, required, selectionText, sx, btnText, onSelect, selectedFile } = props;

    return (
        <Container id={id} sx={sx}>
            <LabelContainer>
                <div style={{color: "var(--vscode-editor-foreground)"}}> 
                    <label htmlFor={`${id}-label`}>{label}</label> 
                </div>
                {(required && label) && (<RequiredFormInput />)}
            </LabelContainer>
            <LabelContainer>
                {selectedFile ? <span>{selectedFile}</span> : <div style={{color: "var(--vscode-editor-foreground)"}}>{selectionText}</div>}
            </LabelContainer>
            <BrowseBtn id="file-selector-btn" onClick={onSelect}>
                {btnText || "Select Location"}
            </BrowseBtn>
        </Container>
    );
};
