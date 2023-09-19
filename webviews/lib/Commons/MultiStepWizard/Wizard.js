var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import { VSCodeDivider, VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { createElement } from "react";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
const WizardContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
`;
const WizardActionsContainer = styled.div `
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 10px;
    width: 100%;
    margin-top: 15px;
`;
const StepContainer = styled.div `
    min-height: 40%;
    padding: 15px;
`;
export const Wizard = ({ title, steps, state, setState, onSave, saveButtonText, cancelButtonText, onCancel, closeOnSave, loading }) => {
    var _a;
    const context = useChoreoWebViewContext();
    // const allValidationRules: ValidationRule<T>[] = [steps.map((step) => step.validationRules).flat(), validationRules].flat();
    const currentStepValidationRules = steps[state.currentStep].validationRules;
    useEffect(() => {
        const validateStep = () => __awaiter(void 0, void 0, void 0, function* () {
            setState((prevState) => { return Object.assign(Object.assign({}, prevState), { isStepValidating: true }); });
            const [isStepValid, stepValidationErrors] = yield validateForm(state.formData, currentStepValidationRules, context); // validate the current step data
            // Update the form validity and validation errors in the state
            setState((prevState) => {
                return Object.assign(Object.assign({}, prevState), { isStepValid, stepValidationErrors, isStepValidating: false });
            });
        });
        validateStep();
    }, [state.currentStep]);
    const handleFormDataChange = (formDataUpdater) => __awaiter(void 0, void 0, void 0, function* () {
        // Do update the form data in the state
        setState((prevState) => {
            return Object.assign(Object.assign({}, prevState), { formData: formDataUpdater(prevState.formData), isStepValidating: true });
        });
        const updatedData = formDataUpdater(state.formData);
        // const [isFormValid, validationErrors] = await validateForm(updatedData, allValidationRules, context); // validate the entire form data
        const [isStepValid, stepValidationErrors] = yield validateForm(updatedData, currentStepValidationRules, context); // validate the current step data
        // Update the form validity and validation errors in the state
        setState((prevState) => {
            return Object.assign(Object.assign({}, prevState), { isStepValid, stepValidationErrors, isStepValidating: false });
        });
    });
    const handlePrevClick = () => __awaiter(void 0, void 0, void 0, function* () {
        let prevStep = state.currentStep - 1;
        setState((prevState) => {
            var _a;
            const shouldSkip = (_a = steps[prevStep]) === null || _a === void 0 ? void 0 : _a.shouldSkip;
            const shouldSkipPrevStep = shouldSkip && shouldSkip(prevState.formData, context) && prevStep >= 0;
            if (shouldSkipPrevStep) {
                prevStep = prevStep - 1;
            }
            return (Object.assign(Object.assign({}, prevState), { currentStep: prevStep }));
        });
    });
    const handleNextClick = () => __awaiter(void 0, void 0, void 0, function* () {
        setState((prevState) => (Object.assign(Object.assign({}, prevState), { isStepValidating: true })));
        const [isStepValid, stepValidationErrors] = yield validateForm(state.formData, currentStepValidationRules, context);
        if (!isStepValid) {
            setState((prevState) => (Object.assign(Object.assign({}, prevState), { isStepValid, stepValidationErrors, isStepValidating: false })));
            return;
        }
        setState((prevState) => {
            var _a;
            let nextStep = prevState.currentStep + 1;
            const shouldSkip = (_a = steps[nextStep]) === null || _a === void 0 ? void 0 : _a.shouldSkip;
            const shouldSkipNextStep = shouldSkip && shouldSkip(prevState.formData, context);
            if (shouldSkipNextStep) {
                nextStep = nextStep + 1;
            }
            return (Object.assign(Object.assign({}, prevState), { currentStep: nextStep, isStepValidating: false }));
        });
    });
    const handleSaveClick = () => __awaiter(void 0, void 0, void 0, function* () {
        setState((prevState) => (Object.assign(Object.assign({}, prevState), { isSaving: true, saveError: undefined })));
        try {
            yield onSave(state.formData, context);
            if (closeOnSave) {
                ChoreoWebViewAPI.getInstance().closeWebView();
            }
        }
        catch (error) {
            setState((prevState) => (Object.assign(Object.assign({}, prevState), { isSaving: false, saveError: error.message })));
            ChoreoWebViewAPI.getInstance().showErrorMsg(error.message);
        }
    });
    const handleCancelClick = () => __awaiter(void 0, void 0, void 0, function* () {
        if (onCancel) {
            onCancel(state.formData, context);
        }
        ChoreoWebViewAPI.getInstance().closeWebView();
    });
    const validateForm = (formData, validationRules, context) => __awaiter(void 0, void 0, void 0, function* () {
        let isFormValid = true;
        const validationErrors = {};
        const validations = [];
        validationRules.forEach((rule) => {
            const value = formData[rule.field];
            validations.push(rule.rule(value, formData, context));
        });
        const results = yield Promise.all(validations);
        results.forEach((result, index) => {
            if (!result) {
                isFormValid = false;
                validationErrors[validationRules[index].field] = validationRules[index].message;
            }
        });
        // handle validation errors here
        return [isFormValid, validationErrors];
    });
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
        return (React.createElement(WizardActionsContainer, null,
            (state.isStepValidating || state.isSaving) && (React.createElement(VSCodeProgressRing, { style: { height: 24 } })),
            React.createElement(VSCodeButton, { appearance: "secondary", onClick: handleCancelClick, disabled: state.isSaving }, cancelButtonText ? cancelButtonText : "Cancel"),
            currentStep > 0 && (React.createElement(VSCodeButton, { onClick: handlePrevClick, disabled: state.isSaving }, "Previous")),
            !isLastStep && (React.createElement(VSCodeButton, { onClick: handleNextClick, disabled: !state.isStepValid || state.isSaving || loading, id: 'wizard-next-btn' }, "Next")),
            isLastStep && (React.createElement(VSCodeButton, { onClick: handleSaveClick, disabled: !state.isStepValid || state.isSaving || loading, id: 'wizard-save-btn' }, saveButtonText ? saveButtonText : "Save"))));
    };
    return (React.createElement(WizardContainer, null,
        React.createElement("h1", null, title),
        React.createElement("h4", null, (_a = steps[state.currentStep]) === null || _a === void 0 ? void 0 : _a.title),
        React.createElement(VSCodeDivider, null),
        React.createElement(StepContainer, null, renderStep()),
        React.createElement(VSCodeDivider, null),
        renderButtons()));
};
//# sourceMappingURL=Wizard.js.map