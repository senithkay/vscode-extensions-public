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
import React, { useState } from "react";

import { ServiceDeclaration, STNode } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";

import { ServiceIcon } from "../../../../../../assets/icons";
import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { STModification } from "../../../../../../Definitions";
import { DraftUpdatePosition } from "../../../../../view-state/draft";
import { useStyles as useFormStyles } from "../style";

import { HttpServiceForm } from "./forms/HttpService";
import { ServiceTypeSelector } from "./ServiceTypeSelector";
import { getServiceTypeFromModel } from "./util";

interface ServiceConfigFormProps {
    model?: ServiceDeclaration;
    targetPosition?: DraftUpdatePosition;
    onCancel: () => void;
    onSave: () => void;
}

export enum ServiceTypes {
    HTTP = 'http'
}

export function ServiceConfigForm(props: ServiceConfigFormProps) {
    const formClasses = useFormStyles();
    const { model, targetPosition, onSave, onCancel } = props;
    const { props: { stSymbolInfo } } = useDiagramContext();
    const [serviceType, setServiceType] = useState<string>(getServiceTypeFromModel(model, stSymbolInfo));

    let configForm = <div />;

    switch (serviceType) {
        case ServiceTypes.HTTP:
            configForm = <HttpServiceForm onSave={onSave} onCancel={onCancel} model={model} targetPosition={targetPosition} />
            break;

    }

    return (
        <FormControl data-testid="log-form" className={formClasses.wizardFormControl}>
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.mainTitleWrapper}>
                    <ServiceIcon color={'#CBCEDB'} />
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2} paddingLeft={15}>Service</Box>
                    </Typography>
                </div>
            </div>

            <div className={formClasses.formWrapper}>
                {!serviceType && <ServiceTypeSelector onSelect={setServiceType} />}
                {serviceType && configForm}
            </div>
        </FormControl>
    )
}
