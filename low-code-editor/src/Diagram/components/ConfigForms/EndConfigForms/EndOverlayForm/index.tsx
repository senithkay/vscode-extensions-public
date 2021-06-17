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
import { useDispatch } from "react-redux";

import { ActionStatement, ExpressionFunctionBody, RemoteMethodCallAction, ReturnStatement, SimpleNameReference, STKindChecker } from "@ballerina/syntax-tree";
import { diagramPanLocation as acDiagramPanLocation } from 'store/actions/preference';

import { Context } from "../../../../../..//src/Contexts/Diagram";
import { DefaultConfig } from "../../../../../../src/Diagram/visitors/default";
import { WizardType } from "../../../../../ConfigurationSpec/types";
import { ConfigOverlayFormStatus } from "../../../../../Definitions";
import { TextPreloaderVertical } from "../../../../../PreLoader/TextPreloaderVertical";
import { EndConfig, RespondConfig } from "../../../Portals/ConfigForm/types";
import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from "../../../Portals/Overlay";

import { AddRespondForm } from "./AddRespondForm";
import { AddReturnForm } from "./AddReturnForm";
interface EndOverlayFormProps {
    config: EndConfig;
    onCancel: () => void;
    onSave: () => void;
    position: DiagramOverlayPosition;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function EndOverlayForm(props: EndOverlayFormProps) {
    const { config, onCancel, onSave, position, configOverlayFormStatus } = props;
    const { isLoading, error, formType } = configOverlayFormStatus;
    const isExpressionFunctionBody: boolean = config.model ?
        STKindChecker.isExpressionFunctionBody(config.model) : false;
    const { state } = useContext(Context);
    const { onFitToScreen, appInfo } = state;

    const dispatch = useDispatch();
    const diagramPanLocation = (appId: number, panX: number, panY: number) => dispatch(acDiagramPanLocation(appId, panX, panY));
    const currentAppid = appInfo?.currentApp?.id;

    React.useEffect(() => {
        onFitToScreen(currentAppid);
        diagramPanLocation(currentAppid, 0, (-position.y + (DefaultConfig.dotGap * 3)));
    }, []);

    if (formType === "Return") {
        config.expression = "";
    } else if (formType === "Respond") {
        config.expression = {
            respondExpression: "",
            variable: "",
            caller: "caller",
            genType: ""
        };
    }

    if (config.wizardType === WizardType.EXISTING && formType === "Respond") {
        const respondModel: ActionStatement = config.model as ActionStatement;
        const remoteCallModel: RemoteMethodCallAction = respondModel?.expression.expression as RemoteMethodCallAction;
        const respondFormConfig: RespondConfig = config.expression as RespondConfig;
        respondFormConfig.respondExpression = remoteCallModel?.arguments[0].source;
    } else if (config.wizardType === WizardType.EXISTING && formType === "Return") {
        if (isExpressionFunctionBody) {
            const expressionEditor: ExpressionFunctionBody = config?.model as ExpressionFunctionBody;
            config.expression = expressionEditor.expression?.source;
        } else {
            const returnStmt = config.model as ReturnStatement;
            const returnExpression = returnStmt.expression;
            config.expression = returnExpression?.source;
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
                            {formType === "Return" && <AddReturnForm config={config} onSave={onSave} onCancel={onCancel} />}
                            {formType === "Respond" && <AddRespondForm config={config} onSave={onSave} onCancel={onCancel} />}
                        </>
                    </DiagramOverlay>
                </DiagramOverlayContainer>
            </div>
        );
    }
}
