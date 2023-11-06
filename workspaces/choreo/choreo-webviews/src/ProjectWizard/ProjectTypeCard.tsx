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

import { ComponentCard } from "@wso2-enterprise/ui-toolkit/lib/components/ComponentCard";
import { Typography } from "@wso2-enterprise/ui-toolkit/lib/components/Typography";

export interface ProjectTypeCardProps {
    isCurrentMonoRepo: boolean;
    onChange: (type: boolean) => void;
    isMonoRepo: boolean;
    label: string;
}

export const ProjectTypeCard: React.FC<ProjectTypeCardProps> = (props) => {
    const { isMonoRepo, label, isCurrentMonoRepo, onChange } = props;
    const isSelected = isCurrentMonoRepo === isMonoRepo;

    const setSelectedType = (isMonoRepo: boolean) => {
        onChange(isMonoRepo);
    };

    const onSelection = () => {
        setSelectedType(isMonoRepo);
    };

    return (
        <ComponentCard isSelected={isSelected} onClick={onSelection} id={`${label}-card`}>
            <Typography variant="h4">{label}</Typography>
        </ComponentCard>
    );
};
