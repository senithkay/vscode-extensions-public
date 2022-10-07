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
import HomeIcon from '@material-ui/icons/Home';

export interface DataMapperHeaderProps {
    onClose: () => void;
}

export function UnSupportedDataMapperHeader(props: DataMapperHeaderProps) {
    const { onClose } = props;
    return (
        <HeaderContainer>
            <HomeButton onClick={onClose} />
            <Title> Data Mapper: </Title>
        </HeaderContainer>
    );
}

const HeaderContainer = styled.div`
    width: 100%;
    height: 50px;
    display: flex;
    padding: 15px;
    background-color: white;
`;

const HomeButton = styled(HomeIcon)`
    cursor: pointer;
    margin-right: 10px;
`;

const Title = styled.div`
    font-weight: 600;
    margin-right: 10px;
`;
