/// <reference types="react" />
import { ComponentWizardState } from "../types";
export interface GithubRepoBranchSelectorProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
}
export declare function GithubRepoBranchSelector(props: GithubRepoBranchSelectorProps): JSX.Element;
