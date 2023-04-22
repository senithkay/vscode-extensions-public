/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import * as hbs from "handlebars";

import templates from "../../templates/components";
import { Parameter } from "../../types";

export async function getInsertTemplate(insertTempName: string) {
    return templates[insertTempName];
}

const hbsInstance = hbs.create();
hbsInstance.registerHelper('checkConfigurable', (listenerParam: Parameter[]) => {
    const data = listenerParam.find((params) => params.name === 'listenerConfig')
    return !!data;
});
export async function getInsertComponentSource(insertTempName: string, config: { [key: string]: any }) {
    const hbTemplate = hbsInstance.compile(await getInsertTemplate(insertTempName));
    return hbTemplate(config);
}
