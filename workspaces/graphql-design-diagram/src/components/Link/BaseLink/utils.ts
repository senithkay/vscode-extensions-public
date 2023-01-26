/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

import { PortModelAlignment } from '@projectstorm/react-diagrams';

export function getOpposingPort(currentPortID: string, port: PortModelAlignment): string {
    if (port === PortModelAlignment.LEFT) {
        return currentPortID.replace(PortModelAlignment.RIGHT, PortModelAlignment.LEFT);
    } else if (port === PortModelAlignment.RIGHT) {
        return currentPortID.replace(PortModelAlignment.LEFT, PortModelAlignment.RIGHT);
    } else if (port === PortModelAlignment.TOP) {
        return currentPortID.replace(PortModelAlignment.BOTTOM, PortModelAlignment.TOP);
    } else {
        return currentPortID.replace(PortModelAlignment.TOP, PortModelAlignment.BOTTOM);
    }
}
