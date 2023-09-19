import { WizardProps } from "./types";
export declare const Wizard: <T extends {}>({ title, steps, state, setState, onSave, saveButtonText, cancelButtonText, onCancel, closeOnSave, loading }: WizardProps<T>) => JSX.Element;
