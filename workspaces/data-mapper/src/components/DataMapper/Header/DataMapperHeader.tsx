/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import styled from "@emotion/styled";
import { withStyles } from "@material-ui/core/styles";
import TooltipBase from "@material-ui/core/Tooltip";

import RoundEditIcon from "../../../assets/icons/RoundEditIcon";
import { useDMSearchStore } from "../../../store/store";
import { SelectionState, ViewOption } from "../DataMapper";

import FieldFilter from "./FieldFilter";
import HeaderBreadcrumb from "./HeaderBreadcrumb";

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
    const TooltipComponent = withStyles(headerStyles)(TooltipBase);
    const dmStore = useDMSearchStore.getState();

    return (
        <HeaderContainer>
            <BreadCrumb>
                <Title> Data Mapper: </Title>
                <HeaderBreadcrumb
                    selection={selection}
                    changeSelection={changeSelection}
                />
                <FieldFilter
                    searchText={dmStore.inputSearch}
                    onSearchTextChange={dmStore.setInputSearch}
                />
                <FieldFilter
                    searchText={dmStore.outputSearch}
                    onSearchTextChange={dmStore.setOutputSearch}
                />
            </BreadCrumb>
            {dmSupported && (
                <TooltipComponent
                    interactive={false}
                    arrow={true}
                    title={"Edit data mapper name, inputs and the output"}
                >
                    <ConfigurationButton
                        onClick={onConfigOpen}
                    >
                        <RoundEditIcon/>
                        <ConfBtnText>Configure</ConfBtnText>
                    </ConfigurationButton>
                </TooltipComponent>
            )}
        </HeaderContainer>
    );
}

const HeaderContainer = styled.div`
    width: 100%;
    height: 50px;
    display: flex;
    padding: 15px;
    background-color: #f7f8fb;
    align-items: center;
    border-bottom: 1px solid rgba(102,103,133,0.15);
`;

const Title = styled.div`
    font-weight: 600;
    margin-right: 10px;
`;

const ConfigurationButton = styled.div`
    :hover {
        background: #e5e6ea;
        cursor: pointer;
    },
    box-sizing: border-box;
    padding: 4px 16px 4px 10px;
    background: #F7F8FB;
    border: 1px solid #E0E2E9;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 5px;
    display: inline-flex;
    color: #40404B;
    align-items: center;
    position: absolute;
    right: 15px;
`;

const ConfBtnText = styled.div`
    font-weight: 400;
    font-size: 13px;
    line-height: 24px;
    margin-left: 5px;
`;

const BreadCrumb = styled.div`
    width: 90%;
    display: flex;
`;
