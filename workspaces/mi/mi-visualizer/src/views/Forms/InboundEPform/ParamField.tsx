/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { CheckBox, Dropdown, TextField } from '@wso2-enterprise/ui-toolkit';

const ParamField = ({ field, id, stateValue, handleOnChange }: any) => {
    const { name, type, value, items } = field;

    const getParameterName = (id: string) => {
        return id.split(".").map((word: string) => 
            word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    }

    return (
        <div style={{
            marginBottom: "20px",
        }}>
            {type === "text" ? (
                <TextField
                    value={stateValue ?? String(value)}
                    id={id}
                    label={name ?? getParameterName(id)}
                    onChange={(text: string) => handleOnChange(id, text)}
                />
            ) : type === "checkbox" ? (
                <CheckBox
                    label={name ?? getParameterName(id)}
                    value={stateValue ?? value}
                    checked={!!stateValue ?? !!value}
                    onChange={(checked: boolean) => handleOnChange(id, checked)}
                />
            ) : type === "dropdown" ? (
                <>
                    <span>Sequence</span>
                    <Dropdown
                        id={id}
                        value={stateValue ?? value}
                        onChange={(text: string) => handleOnChange(id, text)}
                        items={items}
                    />
                </>
            ) : <></>}
        </div>
    );
};

export default ParamField;
