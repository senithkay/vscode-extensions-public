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

import { ComponentWizardState } from "../types";
import { BYOCRepoConfig } from "./BYOCRepoConfig";
import { WebAppRepoConfig } from "./WebAppRepoConfig";
import { BuildPackConfig } from "./BuildPackConfig";
import { MIConfig } from "./MIConfig";
import { ChoreoComponentType, ChoreoImplementationType } from "@wso2-enterprise/choreo-core";
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
        ChoreoImplementationType.Docker
    ].includes(implementationType as ChoreoImplementationType);

    return (
        <div>
            {(implementationType === ChoreoImplementationType.Ballerina) && (
                <BalSubPathConfig {...props}/>
            )}
            {implementationType === ChoreoImplementationType.Docker && (
                <BYOCRepoConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
            )}
            {type === ChoreoComponentType.WebApplication && !isBuildPackType && (
                <WebAppRepoConfig 
                    formData={props.formData} 
                    onFormDataChange={props.onFormDataChange} 
                    webAppConfigError={props.formErrors['webAppConfig'] || props.formErrors['port']}
                />
            )}
            {isBuildPackType && (
                <BuildPackConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
            )}
            {implementationType === ChoreoImplementationType.MicroIntegrator && (
                <MIConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
            )}
        </div>
    );
};
