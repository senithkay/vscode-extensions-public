var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { PUSH_ALL_COMPONENTS_TO_CHOREO_EVENT } from "@wso2-enterprise/choreo-core";
import { useChoreoComponentsContext } from "../context/choreo-components-ctx";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
export function useComponentPushAll() {
    const queryClient = useQueryClient();
    const { choreoProject } = useChoreoWebViewContext();
    const { refreshComponents } = useChoreoComponentsContext();
    const { mutate: handlePushAllComponentsClick, isLoading: pushingAllComponents } = useMutation({
        mutationFn: (componentNames) => ChoreoWebViewAPI.getInstance().pushLocalComponentsToChoreo({
            projectId: choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id,
            orgId: parseInt(choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.orgId),
            componentNames
        }),
        onError: (error) => {
            if (error.message) {
                ChoreoWebViewAPI.getInstance().showErrorMsg(error.message);
            }
        },
        onMutate: () => {
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: PUSH_ALL_COMPONENTS_TO_CHOREO_EVENT,
            });
        },
        onSuccess: (componentNames) => __awaiter(this, void 0, void 0, function* () {
            yield queryClient.cancelQueries({ queryKey: ["project_component_list", choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id] });
            const previousComponents = queryClient.getQueryData([
                "project_component_list",
                choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id,
            ]);
            const updatedComponents = previousComponents === null || previousComponents === void 0 ? void 0 : previousComponents.map((item) => (Object.assign(Object.assign({}, item), { local: item.local ? !(componentNames === null || componentNames === void 0 ? void 0 : componentNames.includes(item.name)) : false })));
            queryClient.setQueryData(["project_component_list", choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id], updatedComponents);
            refreshComponents();
        }),
    });
    return { handlePushAllComponentsClick, pushingAllComponents };
}
//# sourceMappingURL=use-component-push-all.js.map