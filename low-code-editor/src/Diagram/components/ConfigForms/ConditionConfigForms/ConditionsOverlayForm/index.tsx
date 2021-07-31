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

import { Context } from "../../../../../Contexts/Diagram";
import { ConfigOverlayFormStatus } from "../../../../../Definitions";
import { DefaultConfig } from "../../../../../Diagram/visitors/default";
import { TextPreloaderVertical } from "../../../../../PreLoader/TextPreloaderVertical";
import { DiagramContext } from "../../../../../providers/contexts";
import { ConditionConfig } from "../../../Portals/ConfigForm/types";
import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from "../../../Portals/Overlay";

import { AddForeachForm } from "./AddForeachForm";
import { AddIfForm } from "./AddIfForm/index";
import { AddWhileForm } from "./AddWhileForm";

interface ConditionsWizardProps {
    condition: ConditionConfig;
    onCancel: () => void;
    onSave: () => void;
    isNewConditionForm: boolean;
    position: DiagramOverlayPosition
    configOverlayFormStatus: ConfigOverlayFormStatus
}


export function ConditionsOverlayForm(props: ConditionsWizardProps) {
    const { diagramPanLocation } = useContext(DiagramContext).callbacks;
    const { condition, onCancel, onSave, isNewConditionForm, position, configOverlayFormStatus } = props;
    const { isLoading, error, formType } = configOverlayFormStatus;
    const { state } = useContext(Context);
    const { onFitToScreen, appInfo } = state;

    const currentAppid = appInfo?.currentApp?.id;

    React.useEffect(() => {
        onFitToScreen(currentAppid);
        diagramPanLocation(currentAppid, 0, (-position.y + (DefaultConfig.dotGap * 3)));
    }, []);

    if (formType === "if" || formType === "While") {
        if (isNewConditionForm) {
            condition.conditionExpression = "";
        }
    } else if (formType === "ForEach") {
        if (isNewConditionForm) {
            condition.conditionExpression = {
                variable: '', collection: ''
            };
        }
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
                            {formType === "If" && <AddIfForm condition={condition} onSave={onSave} onCancel={onCancel} />}
                            {formType === "ForEach" && <AddForeachForm condition={condition} onSave={onSave} onCancel={onCancel} isNewConditionForm={isNewConditionForm} />}
                            {formType === "While" && <AddWhileForm condition={condition} onSave={onSave} onCancel={onCancel} />}
                        </>
                    </DiagramOverlay>
                </DiagramOverlayContainer>
            </div>
        );
    }
}

