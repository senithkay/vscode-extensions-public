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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React from "react";
import styled from "@emotion/styled";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { DesignDiagram } from "@wso2-enterprise/project-design-diagrams";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
const WizardContainer = styled.div `
    width: 100vw;
    height: 100vh;
`;
export function ChoreoArchitectureView(props) {
    const { orgName, projectId } = props;
    const { currentProjectOrg } = useChoreoWebViewContext();
    const getComponentModel = () => __awaiter(this, void 0, void 0, function* () {
        if (projectId && orgName) {
            const response = yield ChoreoWebViewAPI.getInstance().getDiagramComponentModel(projectId, currentProjectOrg === null || currentProjectOrg === void 0 ? void 0 : currentProjectOrg.id);
            return response;
        }
        throw new Error("Error while loading project resources.");
    });
    return (React.createElement(WizardContainer, null,
        React.createElement(DesignDiagram, { isEditable: false, isChoreoProject: true, getComponentModel: getComponentModel })));
}
//# sourceMappingURL=ArchitectureView.js.map