/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import styled from "@emotion/styled";

import { SelectionState, ViewOption } from "../DataMapper";

import ConfigureButton from "./ConfigureButton";
import HeaderBreadcrumb from "./HeaderBreadcrumb";
import SearchBox from "./SearchBox";

export const headerStyles = {
    tooltip: {
        color: "#8d91a3",
        backgroundColor: "#fdfdfd",
        border: "1px solid #e6e7ec",
        borderRadius: 6,
        padding: "1rem"
    },
    arrow: {
        color: "#fdfdfd"
    }
};

export interface DataMapperHeaderProps {
    selection: SelectionState;
    dmSupported: boolean;
    changeSelection: (mode: ViewOption, selection?: SelectionState, navIndex?: number) => void;
    onConfigOpen: () => void;
}

export function DataMapperHeader(props: DataMapperHeaderProps) {
    const { selection, dmSupported, changeSelection, onConfigOpen } = props;

    return (
        <HeaderContainer>
            <BreadCrumb>
                <Title> Data Mapper: </Title>
                <HeaderBreadcrumb
                    selection={selection}
                    changeSelection={changeSelection}
                />
            </BreadCrumb>
            {dmSupported && (
                <>
                    <FilterBar>
                        <SearchBox selection={selection} />
                    </FilterBar>
                    <ConfigureButton onClick={onConfigOpen}/>
                </>
            )}
        </HeaderContainer>
    );
}

const HeaderContainer = styled.div`
    height: 50px;
    display: flex;
    padding: 15px;
    background-color: #f7f8fb;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(102,103,133,0.15);
`;

const Title = styled.div`
    font-weight: 600;
    margin-right: 10px;
`;

const BreadCrumb = styled.div`
    width: 60%;
    display: flex;
`;

const FilterBar = styled.div`
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 20px;
`;
