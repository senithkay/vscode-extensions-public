import { ComponentWizardState } from "../types";
export interface RepoStructureConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
    formErrors: Record<keyof ComponentWizardState, string>;
}
export declare const RepoStructureConfig: (props: RepoStructureConfigProps) => JSX.Element;
