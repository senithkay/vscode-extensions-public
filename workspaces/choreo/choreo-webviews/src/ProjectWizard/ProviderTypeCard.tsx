/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

import styled from "@emotion/styled";
import { GitProvider } from "@wso2-enterprise/choreo-core";
import { BitBucketIcon, GithubIcon } from "../icons";
import { ComponentCard, Typography } from "@wso2-enterprise/ui-toolkit";

const IconContainer = styled.div`
    height: 50px;
    width: 50px;
`

export interface ProviderTypeCardProps {
    currentType: GitProvider;
    onChange: (type: GitProvider) => void;
    type: GitProvider;
    label: string;
}

export const ProviderTypeCard: React.FC<ProviderTypeCardProps> = (props) => {
    const { type, label, currentType, onChange } = props;
    const isSelected = currentType === type;

    const setSelectedType = (type: GitProvider) => {
        onChange(type);
    };

    const onSelection = () => {
        setSelectedType(type);
    };

    return (
        <ComponentCard isSelected={isSelected} onClick={onSelection} id={`${label}-card`}>
            <IconContainer>
                {type === GitProvider.BITBUCKET ? <BitBucketIcon /> : <GithubIcon />}
            </IconContainer>
            <Typography variant="h4">{label}</Typography>
        </ComponentCard>
    );
};
