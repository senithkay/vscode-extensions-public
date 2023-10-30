/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Overview } from "@wso2-enterprise/overview";
import { BallerinaClient } from "@wso2-enterprise/ballerina-client"
import React, { useEffect } from "react";


export function Webview() {
    const [view, setView] = React.useState("Overview");

    useEffect(() => {
        // update on view change
        BallerinaClient.getInstance().onStateChanged((view: any) => {
            setView(view.viewContext.view);
        });
    }, [view]);
    
    return (
        <>
            {view === "Overview" &&  <Overview /> }
            {view === "Architecture" &&  <h2>Hello Arch</h2> }
            {/* {view === "Architecture" && <DesignDiagram isEditable={true} isChoreoProject={false} getComponentModel={null} /> } */}
        </>
    );
}