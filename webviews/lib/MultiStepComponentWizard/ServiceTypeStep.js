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
import React from "react";
import styled from "@emotion/styled";
import { ChoreoServiceType } from "@wso2-enterprise/choreo-core";
import { ConfigCardList } from './ConfigCardList';
const StepContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;
export const ServiceTypeStepC = (props) => {
    const { formData, onFormDataChange } = props;
    return (React.createElement(StepContainer, null,
        React.createElement(ConfigCardList, { formKey: 'serviceType', formData: formData, onFormDataChange: onFormDataChange, items: [
                {
                    label: "REST",
                    description: "Create a REST API service",
                    value: ChoreoServiceType.RestApi
                },
                {
                    label: "GraphQL",
                    description: "Create a GraphQL API service",
                    value: ChoreoServiceType.GraphQL
                }
            ] })));
};
export const ServiceTypeStep = {
    title: 'Service Type',
    component: ServiceTypeStepC,
    validationRules: []
};
//# sourceMappingURL=ServiceTypeStep.js.map