/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import React from "react";

import { ChoreoComponentType, ChoreoImplementationType, ChoreoServiceType } from "@wso2-enterprise/choreo-core";
import { ComponentCard, Typography } from "@wso2-enterprise/ui-toolkit";
import { ComponentWizardState } from "./types";

export interface ComponentTypeCardProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
    value: string | ChoreoComponentType | ChoreoServiceType | ChoreoImplementationType;
    formKey: keyof ComponentWizardState;
    label: string;
    description: string;
}

export const ComponentTypeCard: React.FC<ComponentTypeCardProps> = (props) => {
    const { value, label, description, formData, formKey, onFormDataChange } = props;

    const isSelected = formData[formKey] === value;

    const setSelectedType = (selectedItem: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, [formKey]: selectedItem }));
    };

    return (
        <ComponentCard id={value} isSelected={isSelected} onClick={setSelectedType} description={description}>
            <Typography variant="h4">{label}</Typography>
        </ComponentCard>
    );
};
