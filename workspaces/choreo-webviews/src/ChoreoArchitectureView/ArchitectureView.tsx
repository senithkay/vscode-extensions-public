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

import styled from "@emotion/styled";
import { ComponentModel } from "@wso2-enterprise/choreo-core";
import { useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

const WizardContainer = styled.div`
    width: 100%;
    display  : flex;
    flex-direction: column;
`;

export interface CellViewProps {
    projectId?: string;
    orgName?: string;
}

export function CellView(props: CellViewProps) {
    const { orgName, projectId } = props;
    const [CM, setCM] = useState<Map<string, ComponentModel> | undefined>(undefined);

    const getComponentModel = async (): Promise<Map<string, ComponentModel>> => {
        if (projectId && orgName) {
            let componentModels: Map<string, ComponentModel> = new Map<string, ComponentModel>();
            const response: ComponentModel[] = await ChoreoWebViewAPI.getInstance().getDiagramComponentModel(projectId, orgName);
            for (const model of response) {
                componentModels.set(`${model.packageId.org}/${model.packageId.name}:${model.packageId.version}`, model);
            }
            return componentModels;
        }
        throw new Error("Error while loading project resources.");
    }

    useEffect(() => {
        getComponentModel().then((model: any) => {
            setCM(model);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <WizardContainer>
                <h3>Cell View for orgName {orgName} projectID {projectId}</h3>

                {CM && JSON.stringify(Array.from(CM.entries()), null, 4)}
            </WizardContainer>
        </>
    );
}
