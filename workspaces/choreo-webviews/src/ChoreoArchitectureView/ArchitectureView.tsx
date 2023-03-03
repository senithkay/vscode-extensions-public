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
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { DesignDiagram } from "@wso2-enterprise/project-design-diagrams";

const WizardContainer = styled.div`
    width: 100vw;
    height: 100vh;
`;

export interface CellViewProps {
    projectId?: string;
    orgName?: string;
}

interface ComponentModelResponse {
    [key: string]: ComponentModel;
}

export function CellView(props: CellViewProps) {
    const { orgName, projectId } = props;

    const getComponentModel = async (): Promise<any> => {
        if (projectId && orgName) {
            let componentModels: ComponentModelResponse = {};
            const response: ComponentModel[] = await ChoreoWebViewAPI.getInstance().getDiagramComponentModel(projectId, orgName);
            for (const model of response) {
                componentModels[`${model.packageId.org}/${model.packageId.name}:${model.packageId.version}`] = model;
            }
            return componentModels;
        }
        throw new Error("Error while loading project resources.");
    }

    const enrichChoreoMetadata = async (componentModel: Map<string, ComponentModel>): Promise<Map<string, ComponentModel>> => {
        return componentModel;
    }

    return (
        <WizardContainer>
            <DesignDiagram
                isEditable={false}
                isChoreoProject={true}
                getComponentModel={getComponentModel}
                enrichChoreoMetadata={enrichChoreoMetadata}
            />
        </WizardContainer>
    );
}
