/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DesignDiagram } from "@wso2-enterprise/project-design-diagrams";
import React, { useEffect } from "react";
import { WebViewAPI } from "./WebViewAPI";

export function Webview() {
    const [state, setState] = React.useState("");

    useEffect(() => {
        // update on state change
        WebViewAPI.getInstance().onStateChanged((state: any) => {
            setState(state.viewContext.view);
        });
    }, [state]);
    
    return (
        <>
            {state === "Architecture" && <DesignDiagram isEditable={true} isChoreoProject={false} getComponentModel={null} /> }
            {state === "Overview" &&  <h1>Hello Overview</h1> }
        </>
    );
}