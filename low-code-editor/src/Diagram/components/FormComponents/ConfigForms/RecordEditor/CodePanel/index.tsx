/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";
import { useIntl } from "react-intl";

import { FormControl } from "@material-ui/core";
import { FormHeaderSection } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { useRecordEditorContext } from "../../../../../../Contexts/RecordEditor";
import { mutateTypeDefinition } from "../../../../../utils/modification-util";
import { FormActionButtons } from "../../../FormFieldComponents/FormActionButtons";
import { wizardStyles } from "../../style";
import { RecordField } from "../RecordField";
import { recordStyles } from "../style";
import { getGeneratedCode } from "../utils";

export function CodePanel() {
    const { state } = useRecordEditorContext();
    const { api: { code: { modifyDiagram } } } = useDiagramContext();

    const overlayClasses = wizardStyles();
    const recordClasses = recordStyles();
    const intl = useIntl();

    const saveButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.saveButton.text",
        defaultMessage: "Save"
    });
    const cancelButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.cancelButton.text",
        defaultMessage: "Cancel"
    });

    const handleRecordSave = () => {
        if (state.currentField && state.currentField.name  === "" && (state.currentField.value === "" ||
            state.currentField.value === undefined) && state.currentField.type === "" &&
            state.currentField.isEditInProgress) {
            // Removing draft field
            const index = state.currentRecord.fields.indexOf(state.currentField);
            state.currentRecord.fields.splice(index, 1);
        }
        if (state.recordModel.isTypeDefinition) {
            const accessModifier = state.recordModel.isPublic ? "public" : null;
            if (state.sourceModel) {
                const modelPosition = state.sourceModel.position as NodePosition;
                const updatePosition = {
                    startLine: modelPosition.startLine,
                    startColumn: 0,
                    endLine: modelPosition.endLine,
                    endColumn: modelPosition.endColumn
                };

                modifyDiagram([
                    mutateTypeDefinition(
                        state.recordModel.name,
                        getGeneratedCode(state.recordModel, true),
                        updatePosition,
                        false,
                        accessModifier
                    )
                ]);
            } else {
                modifyDiagram([
                    mutateTypeDefinition(state.recordModel.name, getGeneratedCode(state.recordModel, true),
                        state.targetPosition, true, accessModifier)
                ]);
            }
            state.onCancel();
        } else {
            state.onSave(getGeneratedCode(state.recordModel, true), state.recordModel);
        }
    };

    return (
        <FormControl data-testid="record-form" className={overlayClasses.wizardFormControlExtended}>
            <FormHeaderSection
                formTitle={"lowcode.develop.configForms.recordEditor.codePanel.title"}
                defaultMessage={"Record Configuration"}
                onCancel={state.onCancel}
            />
            <div className={overlayClasses.formWrapper}>
                <div className={recordClasses.recordFieldWrapper}>
                    <RecordField recordModel={state.recordModel} />
                </div>
                <FormActionButtons
                    cancelBtnText={cancelButtonText}
                    saveBtnText={saveButtonText}
                    isMutationInProgress={false}
                    validForm={!state.isEditorInvalid}
                    onSave={handleRecordSave}
                    onCancel={state.onCancel}
                />
            </div>
        </FormControl>
    )
}
