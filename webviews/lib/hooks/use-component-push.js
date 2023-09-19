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
import { useChoreoComponentsContext } from "../context/choreo-components-ctx";
export function useComponentPush(component) {
    const queryClient = useQueryClient();
    const { refreshComponents } = useChoreoComponentsContext();
    const { mutate: handlePushComponentClick, isLoading: pushingSingleComponent } = useMutation({
        mutationFn: (componentName) => ChoreoWebViewAPI.getInstance().pushLocalComponentToChoreo({
            projectId: component.projectId,
            componentName,
        }),
        onError: (error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        onSuccess: (_, name) => __awaiter(this, void 0, void 0, function* () {
            yield queryClient.cancelQueries({
                queryKey: ["project_component_list", component.projectId],
            });
            const previousComponents = queryClient.getQueryData([
                "project_component_list",
                component.projectId,
            ]);
            const updatedComponents = previousComponents === null || previousComponents === void 0 ? void 0 : previousComponents.map((item) => item.name === name ? Object.assign(Object.assign({}, item), { local: false }) : item);
            queryClient.setQueryData(["project_component_list", component.projectId], updatedComponents);
            refreshComponents();
        }),
    });
    return { handlePushComponentClick, pushingSingleComponent };
}
//# sourceMappingURL=use-component-push.js.map