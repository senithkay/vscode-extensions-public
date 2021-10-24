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

import { NodePosition } from "@ballerina/syntax-tree";
import { Box, Typography } from "@material-ui/core";

import { useDiagramContext } from "../../../../../Contexts/Diagram";
import { useRecordEditorContext} from "../../../../../Contexts/RecordEditor";
import { mutateTypeDefinition } from "../../../../utils/modification-util";
import { OverlayBackground } from "../../../OverlayBackground";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { DiagramOverlayContainer } from "../../../Portals/Overlay";
import { wizardStyles } from "../../style";
import { RecordField } from "../RecordField";
import { recordStyles } from "../style";
import { getGeneratedCode } from "../utils";

import "./style.scss";

export function CodePanel() {
    const { state } = useRecordEditorContext();
    const { api: { code: { modifyDiagram } } } = useDiagramContext();

    const overlayClasses = wizardStyles();
    const recordClasses = recordStyles();

    const handleRecordSave = () => {
        if (state.recordModel.isTypeDefinition) {
            const isNewTypeDesc = (state.targetPosition !== undefined);
            const accessModifier = state.recordModel.isPublic ? "public" : null;
            if (!isNewTypeDesc) {
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
                        isNewTypeDesc,
                        accessModifier
                    )
                ]);
            } else {
                modifyDiagram([
                    mutateTypeDefinition(state.recordModel.name, getGeneratedCode(state.recordModel, true),
                        state.targetPosition, isNewTypeDesc, accessModifier)
                ]);
            }
            state.onCancel();
        } else {
            state.onSave(getGeneratedCode(state.recordModel, true), state.recordModel);
        }
    };

    return (
        <div>
            <DiagramOverlayContainer>
                <div className="code-panel">
                    <div className={recordClasses.recordConfigTitleWrapper}>
                        <Typography variant="h4">
                            <Box paddingTop={2} paddingBottom={2}>{"Record Configuration"}</Box>
                        </Typography>
                    </div>
                    <div className={recordClasses.recordTitleSeparator} />
                    <div className={recordClasses.recordFieldWrapper}>
                        <RecordField recordModel={state.recordModel} />
                    </div>
                    <div className={overlayClasses.buttonWrapper}>
                        <SecondaryButton text="Cancel" fullWidth={false} onClick={null} />
                        <PrimaryButton
                            dataTestId={"record-from-json-save-btn"}
                            text={"Save"}
                            disabled={state.isEditorInvalid}
                            fullWidth={false}
                            onClick={handleRecordSave}
                        />
                    </div>
                </div>
                <OverlayBackground/>
            </DiagramOverlayContainer>
        </div>
    )
}
