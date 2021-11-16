import { TextField } from "@material-ui/core";
import React from "react";
import { ConfigProperty } from "./ConfigForm";

function ConfigElement(props: any) {

    let configProperty: ConfigProperty = {
        id: props.moduleName + "-" + props.name,
        name: props.name,
        type: props.type,
        description: props.description,
        required: props.required
    };

    const handleChange = (e: any) => {
        configProperty.value = e.target.value;
        props.setConfigValue(configProperty);
    }

    return (
        <div className="ConfigElement">
            <TextField
                id={props.id}
                required={props.required}
                label={props.name}
                type={props.type}
                margin="normal"
                fullWidth
                value={props.value}
                onChange={handleChange}
                variant="outlined"
            />
        </div>
    );
}

export default ConfigElement;
