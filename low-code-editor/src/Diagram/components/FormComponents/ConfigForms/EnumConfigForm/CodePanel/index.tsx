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
import { FormActionButtons, FormHeaderSection } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { useEnumEditorContext } from "../../../../../../Contexts/EnumEditor";
import { mutateEnumDefinition } from "../../../../../utils/modification-util";
import { wizardStyles } from "../../style";
import { EnumField } from "../EnumField";
import { enumStyles } from "../style";
import { getGeneratedCode, getMemberArray } from "../utils";

export function CodePanel() {
    const { state } = useEnumEditorContext();
    const { api: { code: { modifyDiagram } } } = useDiagramContext();

    const overlayClasses = wizardStyles();
    const enumClasses = enumStyles();
    const intl = useIntl();

    const handleEnumSave = () => {
        if (state.enumModel.isTypeDefinition) {
            const isNewTypeDesc = (!state.sourceModel);
            if (!isNewTypeDesc) {
                const modelPosition = state.sourceModel.position as NodePosition;
                const updatePosition = {
                    startLine: modelPosition.startLine,
                    startColumn: 0,
                    endLine: modelPosition.endLine,
                    endColumn: modelPosition.endColumn
                };

                modifyDiagram([
                    mutateEnumDefinition(
                        state.enumModel.name,
                        getMemberArray(state.enumModel),
                        updatePosition,
                        isNewTypeDesc
                    )
                ]);
            } else {
                modifyDiagram([
                    mutateEnumDefinition(
                        state.enumModel.name,
                        getMemberArray(state.enumModel),
                        state.targetPosition,
                        isNewTypeDesc
                    )
                ]);
            }
            state.onCancel();
        } else {
            state.onSave(getGeneratedCode(state.enumModel, true), state.enumModel);
        }
    };

    return (
        <FormControl data-testid="enum-form" className={overlayClasses.wizardFormControlExtended}>
            <FormHeaderSection
                onCancel={state.onCancel}
                formTitle={"lowcode.develop.configForms.enumConfigForm.codePanel.title"}
                defaultMessage={"Enumeration"}
            />
            <div className={overlayClasses.formWrapperEnum}>
                <div className={enumClasses.enumFieldWrapper}>
                    <EnumField enumModel={state.enumModel} />
                </div>
                <FormActionButtons
                    cancelBtnText="Cancel"
                    cancelBtn={true}
                    saveBtnText="Save"
                    onSave={handleEnumSave}
                    onCancel={state.onCancel}
                    validForm={!(state.isEditorInvalid || (state.currentField && state.currentField.name === ""))}
                />
            </div>
        </FormControl>
    )
}
