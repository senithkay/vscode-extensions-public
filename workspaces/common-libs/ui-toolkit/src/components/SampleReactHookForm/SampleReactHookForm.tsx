/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { TextField } from "../TextField/TextField";
import { Dropdown } from "../Dropdown/Dropdown";
import { TextArea } from "../TextArea/TextArea";

type Inputs = {
    example: string;
    exampleRequired: string;
    name: string;
    age: string;
    address: string;
};

export interface SampleReactHookFormProps {
    id: string;
}

export function SampleReactHookForm(props: SampleReactHookFormProps) {
    const { id } = props;
    const {
        handleSubmit,
        formState: { errors },
        register,
    } = useForm<Inputs>();
    const onSubmit: SubmitHandler<Inputs> = data => console.log(data);
    return (
        <form style={{ display: "flex", flexDirection: "column" }} id={id} onSubmit={handleSubmit(onSubmit)}>
            <input defaultValue="test" {...register("example")} />
            <input {...register("exampleRequired", { required: true })} />
            {errors.exampleRequired && <span>This field is required</span>}
            <TextField
                label="Name"
                id="name"
                {...register("name")}
            />
            <Dropdown
                items= {[{ id: "option-1", content: "Option 1", value: "op1" }, { id: "option-2", content: "Option 2", value: "op2" }, { id: "option-3", content: "Option 3", value: "op3" }]}
                id={"Age"}
                label="Age"
                value={"op1"}
                {...register("age")}    
            />
            <TextArea
                label="Address"
                id="address"
                {...register("address")}
            />
            <input type="submit" />
        </form>
    );
}
