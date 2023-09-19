import { ComponentWizardState } from "../types";
export interface BYOCRepoConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
}
export declare const BYOCRepoConfig: (props: BYOCRepoConfigProps) => JSX.Element;
