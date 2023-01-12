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
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import { ChoreoServiceComponentType } from "@wso2-enterprise/choreo-core";
import { useState } from "react";

export function ComponentTypeSelector(props: { onChange: (type: ChoreoServiceComponentType) => void; }) {

    const [selectedType, setSelectedType] = useState<ChoreoServiceComponentType>(ChoreoServiceComponentType.REST_API);
    
    const onChange = (evt: any) => {
        setSelectedType(evt.target.value);
        props.onChange(evt.target.value);
    };

    return (
        <>
            <label htmlFor="org-dropdown" >Select Service Type</label>
            <VSCodeDropdown id="org-dropdown" onChange={onChange}>
                <VSCodeOption value={ChoreoServiceComponentType.REST_API} selected={selectedType === ChoreoServiceComponentType.REST_API}>REST API</VSCodeOption>
                <VSCodeOption value={ChoreoServiceComponentType.GQL_API} selected={selectedType === ChoreoServiceComponentType.GQL_API}>GraphQL API</VSCodeOption>
                <VSCodeOption value={ChoreoServiceComponentType.WEBSOCKET_API} selected={selectedType === ChoreoServiceComponentType.WEBSOCKET_API}>Websockets API</VSCodeOption>
                <VSCodeOption value={ChoreoServiceComponentType.GRPC_API} selected={selectedType === ChoreoServiceComponentType.GRPC_API}>Grpc API</VSCodeOption>
            </VSCodeDropdown>
        </>
    );
}