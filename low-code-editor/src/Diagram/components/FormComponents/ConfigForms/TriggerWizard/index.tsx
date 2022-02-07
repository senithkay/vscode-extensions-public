/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import React, { useState } from "react";

import { BallerinaConstruct, BallerinaModuleResponse, BallerinaTriggersRequest, DiagramEditorLangClientInterface, Trigger } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { LocalVarDecl } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../Contexts/Diagram";
import { FormGenerator, FormGeneratorProps } from "../../FormGenerator";
import { BallerinaModuleType, Marketplace, SearchQueryParams } from "../Marketplace";


export function TriggerList(props: FormGeneratorProps) {
    const { onCancel, onSave, targetPosition } = props
    const [isMarketPlaceOpen, setMarketPlaceOpen] = useState(true);
    const [triggerArgs, setTriggerArgs] = useState<BallerinaConstruct>();

    const {
        api: {
            ls: { getDiagramEditorLangClient },
        }
    } = useDiagramContext();

    const showTriggerForm = (trigger: Trigger, varNode: LocalVarDecl) => {
        setTriggerArgs(trigger);
        setMarketPlaceOpen(false);
    };

    const fetchTriggersList = async (queryParams: SearchQueryParams): Promise<BallerinaModuleResponse> => {
        const langClient: DiagramEditorLangClientInterface = await getDiagramEditorLangClient();

        const request: BallerinaTriggersRequest = {
            query: queryParams.query,
        };
        request.organization = "ballerinax";
        return langClient.getTriggers(request);
    };

    const handleTriggerFormClose = () => {
        setMarketPlaceOpen(true)
    }
    // TODO: Change the component name as Trigger Wizard
    return (
        <>
            {
                isMarketPlaceOpen ?
                    (
                        <Marketplace
                            balModuleType={BallerinaModuleType.Trigger}
                            onSelect={showTriggerForm}
                            fetchModulesList={fetchTriggersList}
                            title="Triggers"
                            onCancel={onCancel}
                        />
                    ) : (
                        <FormGenerator
                            onCancel={handleTriggerFormClose}
                            configOverlayFormStatus={{ formType: "TriggerForm", isLoading: true, formArgs: triggerArgs }}
                            targetPosition={targetPosition}
                            onSave={onSave}
                        />
                    )}
        </>
    );
}
