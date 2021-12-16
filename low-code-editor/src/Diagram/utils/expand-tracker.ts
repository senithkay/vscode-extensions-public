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
class ExpandTracker {
    private expandedSignatures: string[];
    constructor() {
        this.expandedSignatures = [];
    }

    isExpanded(signature: string): boolean {
        console.log('expand tracker: check >>>', signature);
        return this.expandedSignatures.indexOf(signature) > -1;
    }

    addExpandedSignature(signature: string) {
        console.log('expand tracker: add >>>', signature);
        this.expandedSignatures.push(signature);
    }

    removeExpandedSignature(signature: string) {
        console.log('expand tracker: remove >>>', signature);
        const index = this.expandedSignatures.indexOf(signature);

        if (index > -1) {
            this.expandedSignatures.splice(index, 1);
        }
    }
}

const expandTracker = new ExpandTracker();
export default expandTracker;
