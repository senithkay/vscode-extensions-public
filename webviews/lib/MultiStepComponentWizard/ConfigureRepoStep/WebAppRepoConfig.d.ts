import { ComponentWizardState } from "../types";
export interface WebAppRepoConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
    webAppConfigError?: string;
}
export declare const WebAppRepoConfig: (props: WebAppRepoConfigProps) => JSX.Element;
