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
import { ConnectionPage } from "../connections";
import { ConnectorPage } from "../connectors";

const Wrapper = styled.div`
    height: calc(100vh - 150px);
`;

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 5px;
`;

const SearchStyle = {
    width: 'auto',
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
}
export function HomePage(props: MediatorPageProps) {
    const [searchValue, setSearchValue] = useState<string>('');
    const [isAllMediators, setAllMediators] = useState<boolean>(true);
    const [isConnectors, setConnectors] = useState<boolean>(false);
    const [isEndpoints, setEndpoints] = useState<boolean>(false);

    const handleSearch = (e: string) => {
        setSearchValue(e);
    }

    const clearSearch = () => {
        setSearchValue('');
    }

    const handleAllMediatorsClicked = () => {
        setConnectors(false);
        setEndpoints(false);
        setAllMediators(true);
    }

    const handleConnectorsClicked = () => {
        setAllMediators(false);
        setEndpoints(false);
        setConnectors(true);
    }

    const handleEndpointsClicked = () => {
        setAllMediators(false);
        setConnectors(false);
        setEndpoints(true);
    }

    return (
        <Wrapper>
            <SearchPanel>
                {/* Search bar */}
                <TextField
                    sx={SearchStyle}
                    placeholder="Search"
                    value={searchValue}
                    onTextChange={handleSearch}
                    icon={{
                        iconComponent: searchIcon,
                        position: 'start',
                    }}
                    autoFocus={true}
                />
                {/*  Categories */}
                <ButtonContainer style={{ marginBottom: "10px", width: "calc(100% - 15px)" }}>
                    <Button onClick={handleAllMediatorsClicked} appearance={isAllMediators ? 'primary' : 'secondary'} >
                        <Icon sx={{marginTop: 2, marginRight: 5}} name="module-icon"/>
                        Mediators
                    </Button>

                    <Button onClick={handleConnectorsClicked} appearance={isConnectors ? 'primary' : 'secondary'}>
                        <Icon sx={{marginTop: 2, marginRight: 5}} name="connector"/>
                        Connectors
                    </Button>

                    <Button onClick={handleEndpointsClicked} appearance={isEndpoints ? 'primary' : 'secondary'}>
                        <Icon sx={{marginTop: 2, marginRight: 5}} name="caller"/>
                        Endpoints
                    </Button>
                </ButtonContainer>
            </SearchPanel>
            {isAllMediators && (
                <ComponentList>
                    {/* Mediator List */}
                    <Mediators nodePosition={props.nodePosition} documentUri={props.documentUri} searchValue={searchValue} />
                </ComponentList>
            )}
            {isConnectors && (
                <ComponentList>
                    <ConnectorPage nodePosition={props.nodePosition} documentUri={props.documentUri} searchValue={searchValue} clearSearch={clearSearch} />
                </ComponentList>
            )}
            {isEndpoints && (
                <ComponentList>
                    <ConnectionPage nodePosition={props.nodePosition} documentUri={props.documentUri} searchValue={searchValue} clearSearch={clearSearch} />
                </ComponentList>
            )}
        </Wrapper>
    )
}
