/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { TextField, Button, Codicon, Icon } from "@wso2-enterprise/ui-toolkit";
import React, { useState } from "react";
import { Mediators } from "./List";
import styled from "@emotion/styled";
import { ConnectorPage } from "../connectors";

const Wrapper = styled.div`
    height: calc(100vh - 190px);
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
`;

const BtnStyle = {
    '& > vscode-button': {
        width: '130px',
        borderRadius: '2px',
    },
};

const SearchStyle = {
    width: 'auto',
    marginTop: '20px',
    paddingRight: '15px',

    '& > vscode-text-field': {
        width: '100%',
        height: '50px',
        borderRadius: '5px',
    },
};

const SearchPanel = styled.div`
    height: fit-content;
`;

const ComponentList = styled.div`
    height: 100%;
    overflow-y: auto;
    padding-right: 5px;
`;

const searchIcon = (<Codicon name="search" sx={{ cursor: "auto" }} />);

export interface MediatorPageProps {
    nodePosition: any;
    documentUri: string;
    setContent: any;
}
export function MediatorPage(props: MediatorPageProps) {
    const [searchValue, setSearchValue] = useState<string>('');
    const [isAllMediators, setAllMediators] = useState<boolean>(true);
    const [isLibrary, setLibrary] = useState<boolean>(false);
    const [isConnectors, setConnectors] = useState<boolean>(false);

    const handleSearch = (e: string) => {
        setSearchValue(e);
    }

    const handleAllMediatorsClicked = () => {
        setConnectors(false);
        setAllMediators(true);
        console.log('All Mediators clicked');
    }

    const handleLibraryClicked = () => {
        console.log('Library clicked');
    };

    const handleConnectorsClicked = () => {
        setAllMediators(false);
        setConnectors(true);
        console.log('Connectors clicked');
    }

    return (
        <Wrapper>
            <SearchPanel>
                {/* Search bar */}
                <TextField
                    sx={SearchStyle}
                    placeholder="Search"
                    value={searchValue}
                    onChange={handleSearch}
                    icon={{
                        iconComponent: searchIcon,
                        position: 'start',
                    }}
                    autoFocus={true}
                />
                {/*  Categories */}
                <ButtonContainer style={{ justifyContent: "space-between", marginBottom: "10px", width: "calc(100% - 15px)" }}>
                    <Button onClick={handleAllMediatorsClicked} appearance={isAllMediators ? 'primary' : 'icon'} sx={BtnStyle}>
                        <Icon sx={{marginTop: 2, marginRight: 5}} name="module-icon"/>
                        All Mediators
                    </Button>
                    <Button onClick={handleLibraryClicked} appearance={isLibrary ? 'primary' : 'icon'} sx={BtnStyle}>
                        <Icon sx={{marginTop: 2, marginRight: 5}} name="doc"/>
                        Library
                    </Button>
                    <Button onClick={handleConnectorsClicked} appearance={isConnectors ? 'primary' : 'icon'} sx={BtnStyle}>
                        <Icon sx={{marginTop: 2, marginRight: 5}} name="caller"/>
                        Connectors
                    </Button>
                </ButtonContainer>
            </SearchPanel>
            {isAllMediators && (
                <ComponentList>
                    {/* Mediator List */}
                    <Mediators nodePosition={props.nodePosition} documentUri={props.documentUri} setContent={props.setContent} searchValue={searchValue} />
                </ComponentList>
            )}
            {isConnectors && (
                <ComponentList>
                    <ConnectorPage setContent={props.setContent} documentUri={props.documentUri} searchValue={searchValue} />
                </ComponentList>
            )}
        </Wrapper>
    )
}
