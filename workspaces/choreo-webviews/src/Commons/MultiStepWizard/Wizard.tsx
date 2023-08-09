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
import React, { useEffect } from "react";
import { VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

import styled from "@emotion/styled";
import { createElement } from "react";
import { ValidationRule, WizardProps } from "./types";
import { useChoreoWebViewContext, IChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { Stepper } from "@wso2-enterprise/ui-toolkit";

const WizardContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
`;

const WizardActionsContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 10px;
    width: 100%;
    padding: 15px 0px;
`;

const StepContainer = styled.div`
    width: 100%;
    margin-top: 20px;
`;

const StepperContainer = styled.div`
    width: 100%;
`;

export const Wizard = <T extends {}>({ title, steps, state, setState, onSave, saveButtonText, cancelButtonText, onCancel, closeOnSave, loading }: WizardProps<T>) => {
    const context = useChoreoWebViewContext();

    // const allValidationRules: ValidationRule<T>[] = [steps.map((step) => step.validationRules).flat(), validationRules].flat();
    const currentStepValidationRules = steps[state.currentStep].validationRules;
    const stepperSteps = steps.map(step => step.title);

    useEffect(() => {
        const validateStep = async () => {
            setState((prevState) => { return { ...prevState, isStepValidating: true }; });
            const [isStepValid, stepValidationErrors] = await validateForm(state.formData, currentStepValidationRules, context); // validate the current step data
            // Update the form validity and validation errors in the state
            setState((prevState) => {
                return { ...prevState, isStepValid, stepValidationErrors, isStepValidating: false };
            });
        };
        validateStep();
    }, [state.currentStep]);

    const handleFormDataChange = async (formDataUpdater: (prevFormData: T) => T) => {
        // Do update the form data in the state
        setState((prevState) => {
            return { ...prevState, formData: formDataUpdater(prevState.formData), isStepValidating: true };
        });
        const updatedData = formDataUpdater(state.formData);
        // const [isFormValid, validationErrors] = await validateForm(updatedData, allValidationRules, context); // validate the entire form data
        const [isStepValid, stepValidationErrors] = await validateForm(updatedData, currentStepValidationRules, context); // validate the current step data
        // Update the form validity and validation errors in the state
        setState((prevState) => {
            return { ...prevState, isStepValid, stepValidationErrors, isStepValidating: false };
        });
    };

    const handlePrevClick = async () => {
        let prevStep = state.currentStep - 1;
        setState((prevState) => {
            const shouldSkip = steps[prevStep]?.shouldSkip;
            const shouldSkipPrevStep = shouldSkip && shouldSkip(prevState.formData, context) && prevStep >= 0;
            if (shouldSkipPrevStep) {
                prevStep = prevStep - 1;
            }
            return ({ ...prevState, currentStep: prevStep });
        });
    };

    const handleNextClick = async () => {
        setState((prevState) => ({ ...prevState, isStepValidating: true }));
        const [isStepValid, stepValidationErrors] = await validateForm(state.formData, currentStepValidationRules, context);
        if (!isStepValid) {
            setState((prevState) => ({ ...prevState, isStepValid, stepValidationErrors, isStepValidating: false }));
            return;
        }
        setState((prevState) =>{
            let nextStep = prevState.currentStep + 1;
            const shouldSkip = steps[nextStep]?.shouldSkip;
            const shouldSkipNextStep = shouldSkip && shouldSkip(prevState.formData, context);
            if (shouldSkipNextStep) {
                nextStep = nextStep + 1;
            }
            return ({ ...prevState, currentStep: nextStep, isStepValidating: false })
        });
    };

    const handleSaveClick = async () => {
        setState((prevState) => ({ ...prevState, isSaving: true, saveError: undefined }));
        try {
            await onSave(state.formData, context);
            if (closeOnSave) {
                ChoreoWebViewAPI.getInstance().closeWebView();
            }
        } catch (error: any) {
            setState((prevState) => ({ ...prevState, isSaving: false, saveError: error.message }));
            ChoreoWebViewAPI.getInstance().showErrorMsg(error.message);
        }
    };

    const handleCancelClick = async () => {
        if (onCancel) {
            onCancel(state.formData, context);
        }
        ChoreoWebViewAPI.getInstance().closeWebView();
    };

    const validateForm = async <T extends Record<string, any>>(
        formData: T,
        validationRules: ValidationRule<T>[],
        context: IChoreoWebViewContext
    ): Promise<[boolean, Record<keyof T, string>]> => {
        let isFormValid = true;
        const validationErrors: Record<keyof T, string> = {} as Record<keyof T, string>;
        const validations: Promise<boolean>[] = [];
        validationRules.forEach((rule) => {
            const value = formData[rule.field];
            validations.push(rule.rule(value, formData, context));
        });
        const results = await Promise.all(validations);
        results.forEach((result, index) => {
            if (!result) {
                isFormValid = false;
                validationErrors[validationRules[index].field] = validationRules[index].message;
            }
        });
        // handle validation errors here
        return [isFormValid, validationErrors];
    };

    const renderStep = () => {
        const currentStep = state.currentStep;
        const step = steps[currentStep];
        return createElement(step.component, {
            formData: state.formData,
            onFormDataChange: handleFormDataChange,
            stepValidationErrors: state.stepValidationErrors,
            isStepValidating: state.isStepValidating,
        });
    };

    const renderButtons = () => {
        const currentStep = state.currentStep;
        const isLastStep = currentStep === steps.length - 1;
        return (
            <WizardActionsContainer>
                {(state.isStepValidating || state.isSaving ) && ( <VSCodeProgressRing style={{height: 24}}/> )}         
                <VSCodeButton appearance="secondary" onClick={handleCancelClick} disabled={state.isSaving}>
                    {cancelButtonText ? cancelButtonText : "Cancel"}
                </VSCodeButton>
                {currentStep > 0 && (
                    <VSCodeButton onClick={handlePrevClick} disabled={state.isSaving}>
                        Previous
                    </VSCodeButton>
                )}
                {!isLastStep && (
                    <VSCodeButton onClick={handleNextClick} disabled={!state.isStepValid || state.isSaving || loading} id='wizard-next-btn'>
                        Next
                    </VSCodeButton>
                )}
                {isLastStep && (
                    <VSCodeButton onClick={handleSaveClick} disabled={!state.isStepValid || state.isSaving || loading} id='wizard-save-btn'>
                        {saveButtonText ? saveButtonText : "Save"}
                    </VSCodeButton>
                )}
            </WizardActionsContainer>
        );
    };

    return (
        <WizardContainer>
            <h2>{title}</h2>
            <StepperContainer>
                <Stepper currentStep={state.currentStep} steps={stepperSteps} showStepStatus></Stepper>
            </StepperContainer>
            <StepContainer>
                {renderStep()}
            </StepContainer>
            {renderButtons()}
        </WizardContainer>
    );
};
