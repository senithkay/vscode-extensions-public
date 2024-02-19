/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Button, Codicon, ProgressRing } from '@wso2-enterprise/ui-toolkit';
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import SidePanelContext from './SidePanelContexProvider';
import { MediatorPage } from './mediators';
import { AIPage } from './ai';

const SidePanelContainer = styled.div`
    padding: 15px;

    *{font-family: var(--font-family)}
`;

const LoaderContainer = styled.div`
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 100vh;
    width: 100%;
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
    align-items: center;
`;

const BtnStyle = {
    '& > vscode-button': {
        width: '130px',
        height: '40px',
        borderRadius: '5px',
    },
};

export interface SidePanelListProps {
    nodePosition: Range;
    documentUri: string;
}

const SidePanelList = (props: SidePanelListProps) => {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [isAddMediator, setAddMediator] = useState<boolean>(true);
    const [isGenerate, setGenerate] = useState<boolean>(false);
    const sidePanelContext = React.useContext(SidePanelContext);
    const [pageStack, setPageStack] = useState<any[]>([]);

    // show/hide back button based on pageStack length
    useEffect(() => {
        if (pageStack.length === 0) {
            sidePanelContext.setSidePanelState({
                ...sidePanelContext,
                showBackBtn: false,
                title: "",
            })
        } else {
            sidePanelContext.setSidePanelState({
                ...sidePanelContext,
                showBackBtn: true,
            })
        }
    }, [pageStack]);

    const handleGoBack = () => {
        if (pageStack.length > 0) {
            setPageStack(pageStack.slice(0, -1));
        }
    };

    const handleClose = () => {
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            isOpen: false,
        });
    };

    const handleAddMediatorClick = () => {
        setAddMediator(true);
        setGenerate(false);
    };

    const handleGenerateClick = () => {
        setGenerate(true);
        setAddMediator(false);
    };

    const setContent = async (content: any) => {
        console.log(content);
        setPageStack([...pageStack, content]);
    };

    return (
        <SidePanelContainer>
            {isLoading ? <LoaderContainer>
                < ProgressRing />

            </LoaderContainer > :
                pageStack.length === 0 ? <>
                    {/* Header */}
                    <ButtonContainer>
                        <Button onClick={handleAddMediatorClick} appearance={isAddMediator ? 'primary' : 'secondary'} sx={{ ...BtnStyle, marginLeft: "auto" }}>Add Mediator</Button>
                        <Button onClick={handleGenerateClick} appearance={isGenerate ? 'primary' : 'secondary'} sx={BtnStyle}>Generate</Button>
                        <Codicon name="close" sx={{ marginLeft: "auto" }} onClick={handleClose} />
                    </ButtonContainer>

                    {isAddMediator && <MediatorPage nodePosition={props.nodePosition} documentUri={props.documentUri} setContent={setContent} />}
                    {isGenerate && <AIPage />}
                </> :
                    <>
                        <ButtonContainer>
                            <Codicon name="arrow-left" sx={{ flex: "1" }} onClick={handleGoBack} />
                            <Codicon name="close" sx={{ flex: "1", textAlign: "right" }} onClick={handleClose} />
                        </ButtonContainer>
                        {pageStack[pageStack.length - 1]}
                    </>}
        </SidePanelContainer>
    );
};

export default SidePanelList;
