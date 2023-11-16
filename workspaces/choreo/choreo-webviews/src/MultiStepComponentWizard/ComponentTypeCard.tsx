/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

import { ChoreoComponentType, ChoreoImplementationType, ChoreoServiceType } from "@wso2-enterprise/choreo-core";
import { ComponentCard } from "@wso2-enterprise/ui-toolkit/lib/components/ComponentCard";
import { Typography } from "@wso2-enterprise/ui-toolkit/lib/components/Typography";
import { ComponentWizardState } from "./types";
import styled from "@emotion/styled";

const IconContainer = styled.div`
    height: 50px;
    width: 50px;
`

export interface ComponentTypeCardProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
    value: string | ChoreoComponentType | ChoreoServiceType | ChoreoImplementationType;
    formKey: keyof ComponentWizardState;
    label: string;
    description?: string;
    icon?: string;
}

export const ComponentTypeCard: React.FC<ComponentTypeCardProps> = (props) => {
    const { value, label, description, formData, formKey, onFormDataChange, icon } = props;

    const isSelected = formData[formKey] === value;

    const setSelectedType = (selectedItem: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, [formKey]: selectedItem }));
    };

    return (
        <>
            <ComponentCard id={value} isSelected={isSelected} onClick={setSelectedType} tooltip={description} sx={{height: '60px', width: '180px'}}>
                {icon && (
                    <IconContainer>
                        <img
                            src={icon}
                            alt={"service"}
                        />
                    </IconContainer>
                )}
                <Typography variant="h4">{label}</Typography>
            </ComponentCard>
        </>
    );
};
