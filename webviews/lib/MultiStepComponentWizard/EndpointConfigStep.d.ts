import { ComponentWizardState } from "./types";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
export interface EndpointConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
}
export declare const EndpointConfigStepC: (props: StepProps<Partial<ComponentWizardState>>) => JSX.Element;
export declare const EndpointConfigStep: Step<Partial<ComponentWizardState>>;
