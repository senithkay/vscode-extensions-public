/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import { ComponentInfo, ModuleSummary, PackageSummary } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { Uri } from "monaco-editor";

export interface ComponentViewInfo {
    filePath: string;
    position: NodePosition;
    fileName?: string;
    moduleName?: string;
    uid?: string;
    name?: string;
}

export interface ComponentCollection {
    functions: ComponentViewInfo[];
    services: ComponentViewInfo[];
    records: ComponentViewInfo[];
    objects: ComponentViewInfo[];
    classes: ComponentViewInfo[];
    types: ComponentViewInfo[];
    constants: ComponentViewInfo[];
    enums: ComponentViewInfo[];
    listeners: ComponentViewInfo[];
    moduleVariables: ComponentViewInfo[];
}


export function genFilePath(packageInfo: PackageSummary, module: ModuleSummary, element: ComponentInfo) {
    const filePath = Uri.parse(`${packageInfo.filePath}${module.name ? `modules/${module.name}/` : ''}${element.filePath}`)

    // if (window.navigator.userAgent.indexOf("Win") > -1) {
    //     if (filePath.startsWith('/')) {
    //         filePath = filePath.substring(1);
    //         filePath = filePath.replaceAll(/\//g, '\\');
    //     }
    // }

    return filePath.path;
}
