/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { DiagramCanvas } from "@wso2-enterprise/eggplant-diagram";

const model = {
    nodes: [
        { name: "GetAppointmentFee", links: [{ name: "LogAppointmentFee" }, { name: "CreatePaymentRequest" }] },
        { name: "FunctionStart", links: [{ name: "LogHospitalDetails" }, { name: "CreateAppointmentPayload" }] },
        { name: "LogAppointmentFee", links: [] },
        { name: "FunctionEnd", links: [] },
        { name: "CreatePaymentRequest", links: [{ name: "MakePayment" }] },
        { name: "LogHospitalDetails", links: [] },
        { name: "CreateAppointment", links: [{ name: "GetAppointmentFee" }, { name: "LogAppointment" }] },
        { name: "LogAppointment", links: [] },
        { name: "MakePayment", links: [{ name: "FunctionEnd" }, { name: "LogPaymentResponse" }] },
        { name: "LogPaymentResponse", links: [] },
        { name: "CreateAppointmentPayload", links: [{ name: "CreateAppointment" }] },
    ],
};


const LowCode = () => {
    return (
        <div>
            <DiagramCanvas model={model} />
        </div>
    );
};

export default LowCode;
