import { ComponentTypeCardProps } from './ComponentTypeCard';
import { ComponentWizardState } from "./types";
export declare const ConfigCardList: (props: {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
    formKey: keyof ComponentWizardState;
    items: Pick<ComponentTypeCardProps, "label" | "description" | "value">[];
}) => JSX.Element;
