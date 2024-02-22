/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { TextField, Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import React, { useState } from "react";
import { Mediators } from "./List";
import styled from "@emotion/styled";

const ButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
`;

const BtnStyle = {
    '& > vscode-button': {
        width: '130px',
        height: '40px',
        borderRadius: '5px',
    },
};

const SearchStyle = {
    width: '100%',
    marginTop: '20px',

    '& > vscode-text-field': {
        width: '100%',
        height: '50px',
        borderRadius: '5px',
    },
};
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
        console.log('All Mediators clicked');
    }

    const handleLibraryClicked = () => {
        console.log('Library clicked');
    };

    const handleConnectorsClicked = () => {
        console.log('Connectors clicked');
    }

    return (
        <>
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
            />

            {/*  Categories */}
            <ButtonContainer style={{ justifyContent: "space-between", marginBottom: "10px" }}>
                <Button onClick={handleAllMediatorsClicked} appearance={isAllMediators ? 'primary' : 'secondary'} sx={BtnStyle}>All Mediators</Button>
                <Button onClick={handleLibraryClicked} appearance={isLibrary ? 'primary' : 'secondary'} sx={BtnStyle}>Library</Button>
                <Button onClick={handleConnectorsClicked} appearance={isConnectors ? 'primary' : 'secondary'} sx={BtnStyle}>Connectors</Button>
            </ButtonContainer>

            <div style={{
                overflowY: "auto",
                height: "calc(100vh - 250px)",
                scrollbarWidth: "none"
            }}>
                {/* Mediator List */}
                <Mediators nodePosition={props.nodePosition} documentUri={props.documentUri} setContent={props.setContent} searchValue={searchValue}/>
            </div>
        </>
    )
}