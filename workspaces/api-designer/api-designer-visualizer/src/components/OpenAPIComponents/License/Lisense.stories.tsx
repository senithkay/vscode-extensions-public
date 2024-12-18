/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { OpenAPI } from "../../../Definitions/ServiceDefinitions";
import petstoreJSON from "../../Data/petstoreJSON.json";
import { License } from "./Lisense";
import { ReadOnlyLicense } from "./ReadOnlyLisense";

export default {
    component: License,
    title: 'New Lisense',
};

const apiDefinition: OpenAPI = petstoreJSON as unknown as OpenAPI;

export const LisenseStory = () => {
    return (
        <License lisense={apiDefinition.info.license} onContactChange={() => {}} />
    );
};

export const ReadOnlyLisenseStory = () => {
    return (
        <ReadOnlyLicense license={apiDefinition.info.license} />
    );
}
