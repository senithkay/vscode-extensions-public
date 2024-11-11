/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useState } from "react";
import { OpenAPI } from "../../../../Definitions/ServiceDefinitions";
import petstoreJSON from "../../../OpenAPIDefinition/Data/petstore.json";
import { PathsTreeView } from "./PathsTreeView";

export default {
    component: PathsTreeView,
    title: 'New Paths TreeView',
};

export const PathsTreeViewStory = () => {
    const [apiDefinition, setApiDefinition] = useState<OpenAPI>(petstoreJSON as unknown as OpenAPI);
    return (
        <PathsTreeView
            openAPI={apiDefinition}
            selectedComponent="paths-component-/pets-get"
            onPathTreeViewChange={
                (openAPI: OpenAPI) => {
                    console.log("Path TreeView Change", openAPI);
                    setApiDefinition(openAPI);
                }
            }
            onSelectedItemChange={
                (selectedItem: string) => {
                    console.log("Selected Item Change", selectedItem);
                }
            }
            paths={apiDefinition.paths}
        />
    );
};
