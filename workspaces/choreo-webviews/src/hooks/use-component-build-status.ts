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
import { BuildStatus, Component } from "@wso2-enterprise/choreo-core";

export function useComponentBuildStatus(component: Component) {
    const {
        data: buildData,
        isLoading: isLoadingBuild,
        isRefetching: isRefetchingBuild,
        refetch: refreshBuild,
        error: buildLoadError,
        isFetched,
    } = useQuery({
        queryKey: ["project_component_build_status", component?.id],
        queryFn: async (): Promise<BuildStatus|undefined> => {
            return await ChoreoWebViewAPI.getInstance().getComponentBuildStatus(component);
        },
        refetchOnWindowFocus: true,
        refetchInterval: 15000,
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        enabled: component?.id !== undefined && !component.local,
    });

    return { buildData, isLoadingBuild, isRefetchingBuild, refreshBuild, buildLoadError, isFetched };
}
