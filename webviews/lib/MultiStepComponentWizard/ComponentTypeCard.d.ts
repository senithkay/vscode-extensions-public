import React from "react";
import { ChoreoComponentType, ChoreoImplementationType, ChoreoServiceType } from "@wso2-enterprise/choreo-core";
import { ComponentWizardState } from "./types";
export interface ComponentTypeCardProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
    value: string | ChoreoComponentType | ChoreoServiceType | ChoreoImplementationType;
    formKey: keyof ComponentWizardState;
    label: string;
    description: string;
}
export declare const ComponentTypeCard: React.FC<ComponentTypeCardProps>;
