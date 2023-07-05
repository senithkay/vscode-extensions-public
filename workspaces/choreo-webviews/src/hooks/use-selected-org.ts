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
import { useEffect, useReducer } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { Organization } from "@wso2-enterprise/choreo-core";

// describe the shape of the state
interface SelectedOrgState {
    selectedOrg: Organization;
    userOrgs: Organization[];
    fetchingOrgInfo: boolean;
    error: any;
}

// describe the action types
type SelectedOrgAction =
    | { type: 'setSelectedOrg', payload: Organization }
    | { type: 'setUserOrgs', payload: Organization[] }
    | { type: 'setFetchingOrgInfo', payload: boolean }
    | { type: 'setError', payload: any };

const reducer = (state: SelectedOrgState, action: SelectedOrgAction): SelectedOrgState => {
    switch (action.type) {
        case 'setSelectedOrg':
            return { ...state, selectedOrg: action.payload };
        case 'setUserOrgs':
            return { ...state, userOrgs: action.payload };
        case 'setFetchingOrgInfo':
            return { ...state, fetchingOrgInfo: action.payload };
        case 'setError':
            return { ...state, error: action.payload };
        default:
            throw new Error();
    }
};

export function useSelectedOrg() {

    // a single reducer is used to store the selected org and the list of orgs, as well as the loading state
    const [{ selectedOrg, userOrgs, fetchingOrgInfo, error }, dispatch] = useReducer(reducer, {
        selectedOrg: undefined,
        userOrgs: [],
        fetchingOrgInfo: true,
        error: undefined
    });

    useEffect(() => {
        dispatch({ type: 'setFetchingOrgInfo', payload: true });
        const rpcInstance = ChoreoWebViewAPI.getInstance();
        const fetchOrgInfo = async () => {
            try {
                const currOrg = await rpcInstance.getCurrentOrg();
                dispatch({ type: 'setSelectedOrg', payload: currOrg });
                const allOrgs = await rpcInstance.getAllOrgs();
                dispatch({ type: 'setUserOrgs', payload: allOrgs });
            } catch (err: any) {
                dispatch({ type: 'setError', payload: err });
            }
            dispatch({ type: 'setFetchingOrgInfo', payload: false });
        };
        fetchOrgInfo();
        rpcInstance.onSelectedOrgChanged((newOrg) => {
            dispatch({ type: 'setSelectedOrg', payload: newOrg });
        });
    }, []);

    return { selectedOrg, userOrgs, fetchingOrgInfo, error };
}
