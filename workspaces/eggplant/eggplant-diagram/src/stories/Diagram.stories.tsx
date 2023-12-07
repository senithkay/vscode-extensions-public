/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import { DiagramCanvas } from "../DiagramCanvas";

export default {
    title: "EggplantDiagram",
    component: DiagramCanvas,
} as Meta;

const Template: Story = (args: any) => <DiagramCanvas {...args} />;

export const Simple = Template.bind({});
Simple.args = {
    model: {
        nodes: [
            { name: "A", links: [{ name: "B" }, { name: "C" }] },
            { name: "B", links: [{ name: "FunctionEnd" }] },
            { name: "C", links: [{ name: "FunctionEnd" }] },
            { name: "FunctionStart", links: [{ name: "A" }] },
            { name: "FunctionEnd", links: [] },
        ],
    },
};

export const MultiPorts = Template.bind({});
MultiPorts.args = {
    model: {
        nodes: [
            { name: "A", links: [{ name: "B" }, { name: "C" }, { name: "D" }, { name: "E" }, { name: "G" }, { name: "H" }] },
            { name: "B", links: [{ name: "FunctionEnd" }] },
            { name: "C", links: [{ name: "FunctionEnd" }] },
            { name: "D", links: [{ name: "FunctionEnd" }] },
            { name: "E", links: [{ name: "FunctionEnd" }] },
            { name: "F", links: [{ name: "FunctionEnd" }] },
            { name: "G", links: [{ name: "FunctionEnd" }] },
            { name: "H", links: [{ name: "FunctionEnd" }] },
            { name: "I", links: [{ name: "K" }] },
            { name: "L", links: [{ name: "K" }] },
            { name: "K", links: [{ name: "FunctionEnd" }] },
            { name: "FunctionStart", links: [{ name: "A" }, { name: "F" }, { name: "I" }, { name: "L" }] },
            { name: "FunctionEnd", links: [] },
        ],
    },
};

export const Complex = Template.bind({});
Complex.args = {
    model: {
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
    },
};
