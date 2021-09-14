/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext } from "react";

import { LocalVarDecl } from "@ballerina/syntax-tree";

import { WizardType } from "../../../../../ConfigurationSpec/types";
import { Context } from "../../../../../Contexts/Diagram";
import { ConfigOverlayFormStatus } from "../../../../../Definitions";
import { DefaultConfig } from "../../../../../Diagram/visitors/default";
import { TextPreloaderVertical } from "../../../../../PreLoader/TextPreloaderVertical";
import { ProcessConfig } from "../../../Portals/ConfigForm/types";
import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from "../../../Portals/Overlay";

import { AddCustomStatementConfig } from "./AddCustomStatementConfig";
import { AddDataMappingConfig } from "./AddDataMappingConfig";
import { AddLogConfig } from "./AddLogConfig";
import { AddVariableConfig } from "./AddVariableConfig";

interface ProcessOverlayFormProps {
    config: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
    position: DiagramOverlayPosition;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function ProcessOverlayForm(props: ProcessOverlayFormProps) {
    const { config, onCancel, onSave, position, configOverlayFormStatus } = props;
    const { isLoading, error, formType } = configOverlayFormStatus;
    const {
        api: {
            panNZoom: {
                pan,
                fitToScreen
            }
        }
    } = useContext(Context);

    React.useEffect(() => {
        fitToScreen();
        pan(0, (-position.y + (DefaultConfig.dotGap * 3)));
    }, []);

    if (formType === "Variable") {
        if (config.wizardType === WizardType.EXISTING) {
            const existingVariableModelValue: LocalVarDecl = config.model as LocalVarDecl;
            const existingVariableValue = existingVariableModelValue?.initializer?.source;
            config.config = existingVariableValue ? existingVariableValue : "";
        }
        else {
            config.config = "";
        }


    } else if (formType === "Log") {
        config.config = {
            type: "",
            expression: ""
        };
    } else if (formType === "DataMapper") {
        config.config = {
            inputTypes: [],
            outputType: undefined,
            wizardType: config.wizardType
        }
    } else if (formType === "Call" || formType === "Custom") {
        config.config = {
            expression: ""
        };
    }

    if (isLoading) {
        return (
            <div>
                <DiagramOverlayContainer>
                    <DiagramOverlay
                        position={position}
                    >
                        <>
                            <TextPreloaderVertical position='relative' />
                        </>
                    </DiagramOverlay>
                </DiagramOverlayContainer>
            </div>
        );

    } else if (error) {
        return (
            <div>
                <DiagramOverlayContainer>
                    <DiagramOverlay
                        position={position}
                    >
                        <>
                            {error?.message}
                        </>
                    </DiagramOverlay>
                </DiagramOverlayContainer>

            </div>
        );
    } else {
        return (
            <div>
                <DiagramOverlayContainer>
                    <DiagramOverlay
                        position={position}
                    >
                        <>
                            {formType === "Variable" && <AddVariableConfig config={config} onSave={onSave} onCancel={onCancel} />}
                            {formType === "Log" && <AddLogConfig config={config} onSave={onSave} onCancel={onCancel} />}
                            {formType === "DataMapper" && <AddDataMappingConfig processConfig={config} onSave={onSave} onCancel={onCancel} />}
                            {(formType === "Custom" || formType === "Call") && <AddCustomStatementConfig config={config} onSave={onSave} onCancel={onCancel} />}
                        </>
                    </DiagramOverlay>
                </DiagramOverlayContainer>
            </div>
        );
    }
}


