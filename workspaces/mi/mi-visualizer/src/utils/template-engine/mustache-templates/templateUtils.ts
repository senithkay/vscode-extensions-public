/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Mustache from "mustache";
import { SERVICE } from "../../../constants";
import { getAddApiResourceTemplate, getEditApiResourceTemplate, getEditSequenceTemplate, getEditServiceTemplate } from "./core/api";

export function getXML(name: string, data: { [key: string]: any }) {
    switch (name) {
        case SERVICE.EDIT_SERVICE:
            return Mustache.render(getEditServiceTemplate(), data);
        case SERVICE.ADD_RESOURCE:
            return Mustache.render(getAddApiResourceTemplate(), data);
        case SERVICE.EDIT_RESOURCE:
            return Mustache.render(getEditApiResourceTemplate(), data);
        case SERVICE.EDIT_SEQUENCE:
            return Mustache.render(getEditSequenceTemplate(), data);
        default:
            return "";
    }
}

