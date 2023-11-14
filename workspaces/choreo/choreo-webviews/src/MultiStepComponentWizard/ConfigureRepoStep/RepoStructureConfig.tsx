/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

import { ComponentWizardState } from "../types";
import { BYOCRepoConfig } from "./BYOCRepoConfig";
import { WebAppRepoConfig } from "./WebAppRepoConfig";
import { BuildPackConfig } from "./BuildPackConfig";
import { MIConfig } from "./MIConfig";
import { ChoreoComponentType, ChoreoImplementationType, WebAppSPATypes } from "@wso2-enterprise/choreo-core";
import { BalSubPathConfig } from './BalSubPathConfig';

export interface RepoStructureConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
    formErrors: Record<keyof ComponentWizardState, string>;
}

export const RepoStructureConfig = (props: RepoStructureConfigProps) => {

    const { type, implementationType } = props.formData;

    const isBuildPackType = ![
        ChoreoImplementationType.Ballerina,
        ChoreoImplementationType.MicroIntegrator,
        ChoreoImplementationType.Docker,
        ChoreoImplementationType.StaticFiles,
        ...WebAppSPATypes
    ].includes(implementationType as ChoreoImplementationType);

    if (type === ChoreoComponentType.WebApplication && !isBuildPackType) {
        return (
            <WebAppRepoConfig
                formData={props.formData}
                onFormDataChange={props.onFormDataChange}
                webAppConfigError={props.formErrors['webAppConfig'] || props.formErrors['port']}
            />
        )
    } else if (implementationType === ChoreoImplementationType.Ballerina) {
        return <BalSubPathConfig {...props} />
    } else if (implementationType === ChoreoImplementationType.Docker) {
        return <BYOCRepoConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
    } else if (implementationType === ChoreoImplementationType.MicroIntegrator) {
        return <MIConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
    } else {
        return <BuildPackConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
    }
};
