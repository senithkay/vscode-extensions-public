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
import { VSCodeDivider, VSCodeButton } from "@vscode/webview-ui-toolkit/react";

import styled from "@emotion/styled";
import { createElement, useContext, useState } from "react";
import { ValidationRule, WizardProps } from "./types";
import { ChoreoWebViewContext, IChoreoWebViewContext } from "../../context/choreo-web-view-ctx";

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
    margin-top: 15px;
`;

const StepContainer = styled.div`
    min-height: 40%;
    padding: 15px;
`;

export const Wizard = <T extends {}>({ title, steps, initialState, validationRules, onSave }: WizardProps<T>) => {
    const [state, setState] = useState(initialState);
    const context = useContext(ChoreoWebViewContext);

    const allValidationRules: ValidationRule<T>[] = [steps.map((step) => step.validationRules).flat(), validationRules].flat();
    const currentStepValidationRules = steps[state.currentStep].validationRules;

    const handleFormDataChange = async (updatedData: Partial<T>) => {
        const newFormData = { ...state.formData, ...updatedData };
        const [isFormValid, validationErrors] = await validateForm(newFormData, allValidationRules, context); // validate the entire form data
        const [isStepValid, stepValidationErrors] = await validateForm(newFormData, currentStepValidationRules, context); // validate the current step data
        setState({ ...state, formData: newFormData, isFormValid, validationErrors, isStepValid, stepValidationErrors });
    };

    const handlePrevClick = async () => {
        const currentStep = state.currentStep - 1;
        const [isStepValid, stepValidationErrors] = await validateForm(state.formData, steps[currentStep].validationRules, context);
        setState((prevState) => ({ ...prevState, currentStep, isStepValid, stepValidationErrors }));
    };

    const handleNextClick = async () => {
        const [isStepValid, stepValidationErrors] = await validateForm(state.formData, currentStepValidationRules, context);
        if (!isStepValid) {
            setState({ ...state, isStepValid, stepValidationErrors });
            return;
        }
        setState((prevState) => ({ ...prevState, currentStep: prevState.currentStep + 1 }));
    };

    const handleSaveClick = () => {
        onSave(state.formData);
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
        });
    };

    const renderButtons = () => {
        const currentStep = state.currentStep;
        const isLastStep = currentStep === steps.length - 1;
        return (
            <WizardActionsContainer>
                {currentStep > 0 && (
                    <VSCodeButton onClick={handlePrevClick}>
                        Previous
                    </VSCodeButton>
                )}
                {!isLastStep && (
                    <VSCodeButton onClick={handleNextClick} disabled={!state.isStepValid}>
                        Next
                    </VSCodeButton>
                )}
                {isLastStep && (
                    <VSCodeButton onClick={handleSaveClick} disabled={!state.isStepValid || !state.isFormValid}>
                        Save
                    </VSCodeButton>
                )}
            </WizardActionsContainer>
        );
    };

    return (
        <WizardContainer>
            <h1>{title}</h1>
            <h4>{steps[state.currentStep].title}</h4>
            <VSCodeDivider />
            <StepContainer>
                {renderStep()}
            </StepContainer>
            <VSCodeDivider />
            {renderButtons()}
        </WizardContainer>
    );
};
