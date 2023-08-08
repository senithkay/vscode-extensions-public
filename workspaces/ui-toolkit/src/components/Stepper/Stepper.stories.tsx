/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
/* tslint:disable:variable-name */
import React from 'react';

import { Stepper } from './Stepper';

export default {
    title: 'Stepper',
    component: Stepper,
};

const colors={completedStepColor: "green", currentStepPrimaryColor: "blue",
    currentStepSecondaryColor: "grey", incompletedStepColor: "grey"
};
export const Stepper_Comp = () =>
    (
        <div style={{width: 1000, height: 1000}}>
            <Stepper
                steps={["Create Test Component", "Add Component", "Select Git Repo", "Verify Information"]}
                currentStep={3}
                colors={colors}
            />
            <Stepper
                steps={["Create Test Component", "Add Component", "Select Git Repo", "Verify Information"]}
                currentStep={1}
                colors={colors}
            />
        </div>
    );
