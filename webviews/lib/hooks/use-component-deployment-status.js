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
import { useQuery } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
export function useComponentDeploymentStatus(component) {
    var _a;
    const latestApiVersion = (_a = component === null || component === void 0 ? void 0 : component.apiVersions) === null || _a === void 0 ? void 0 : _a.find(item => item.latest);
    const { data: devDeploymentData, isLoading: isLoadingDeployment, isRefetching: isRefetchingDeployment, refetch: refreshDeployment, error: deploymentLoadError, isFetched, } = useQuery({
        queryKey: ["project_component_deployment_status", component === null || component === void 0 ? void 0 : component.id, latestApiVersion === null || latestApiVersion === void 0 ? void 0 : latestApiVersion.id],
        queryFn: () => __awaiter(this, void 0, void 0, function* () {
            const deploymentData = yield ChoreoWebViewAPI.getInstance().getComponentDevDeployment(component);
            return deploymentData || null;
        }),
        refetchOnWindowFocus: true,
        refetchInterval: 15000,
        onError: (error) => {
            if (error.message) {
                ChoreoWebViewAPI.getInstance().showErrorMsg(error.message);
            }
        },
        enabled: (component === null || component === void 0 ? void 0 : component.id) !== undefined && !component.local && !!latestApiVersion,
    });
    return {
        devDeploymentData,
        isLoadingDeployment,
        isRefetchingDeployment,
        refreshDeployment,
        deploymentLoadError,
        isFetched,
    };
}
//# sourceMappingURL=use-component-deployment-status.js.map