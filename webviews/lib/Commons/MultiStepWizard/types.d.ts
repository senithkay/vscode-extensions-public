/// <reference types="react" />
import { IChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
export interface WizardState<T> {
    currentStep: number;
    formData: T;
    isFormValid: boolean;
    isStepValid: boolean;
    validationErrors: Record<keyof T, string>;
    stepValidationErrors: Record<keyof T, string>;
    isStepValidating: boolean;
    isSaving?: boolean;
    saveError?: string;
}
export interface StepProps<T> {
    formData: T;
    isStepValidating: boolean;
    stepValidationErrors: Record<keyof T, string>;
    onFormDataChange: (formDataUpdater: (prevFormData: T) => T) => Promise<void>;
}
export interface Step<T> {
    title: string;
    component: React.FC<StepProps<T>>;
    validationRules: ValidationRule<T>[];
    shouldSkip?: (formData: T, context: IChoreoWebViewContext) => boolean;
}
export interface WizardProps<T> {
    title: string;
    steps: Step<T>[];
    validationRules: ValidationRule<T>[];
    saveButtonText?: string;
    onSave: (formData: T, context: IChoreoWebViewContext) => Promise<void>;
    cancelButtonText?: string;
    onCancel: (formData: T, context: IChoreoWebViewContext) => void;
    closeOnSave?: boolean;
    state: WizardState<T>;
    setState: React.Dispatch<React.SetStateAction<WizardState<T>>>;
    loading?: boolean;
}
export type ValidationRule<T> = {
    field: keyof T;
    rule: (value: any, formData: T, context: IChoreoWebViewContext) => Promise<boolean>;
    message: string;
};
