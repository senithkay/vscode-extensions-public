/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Transaction } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getTransactionMustacheTemplate() {

    return `
    <transaction {{#action}}action="{{action}}"{{/action}} {{#description}}description="{{description}}"{{/description}} />
    `;
}

export function getTransactionXml(data: { [key: string]: any }) {
    switch (data.action) {
        case "Commit transaction":
            data.action = "commit";
            break;
        case "Fault if no transaction":
            data.action = "fault-if-no-tx";
            break;
        case "Initiate new transaction":
            data.action = "new";
            break;
        case "Resume transaction":
            data.action = "resume";
            break;
        case "Suspend transaction":
            data.action = "suspend";
            break;
        case "Rollback transaction":
            data.action = "rollback";
            break;
        case "Use existing or initiate transaction":
            data.action = "use-existing-or-new";
            break;
        default:
            data.action = "";
    }

    const output = Mustache.render(getTransactionMustacheTemplate(), data)?.trim();
    return output;

}

export function getTransactionFormDataFromSTNode(data: { [key: string]: any }, node: Transaction) {

    if (node.action) {
        switch (node.action) {
            case "commit":
                data.action = "Commit transaction";
                break;
            case "fault-if-no-tx":
                data.action = "Fault if no transaction";
                break;
            case "new":
                data.action = "Initiate new transaction";
                break;
            case "resume":
                data.action = "Resume transaction";
                break;
            case "suspend":
                data.action = "Suspend transaction";
                break;
            case "rollback":
                data.action = "Rollback transaction";
                break;
            case "use-existing-or-new":
                data.action = "Use existing or initiate transaction";
                break;
            default:
                data.action = "";
        }
    }
    return data;
}