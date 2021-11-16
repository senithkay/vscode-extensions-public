import React from "react";
import { useState } from "react";
import ConfigElement from "./ConfigElement";
import { ConfigProperties, ConfigProperty } from "./ConfigForm";

function ConfigElements(props: any) {
    const [configProperty, setConfigProperty] = useState(new Array<ConfigProperty>());

    let configProperties: ConfigProperties = {
        moduleName: props.moduleName,
        properties: new Array<ConfigProperty>()
    };

    const handleSetConfig = (e: ConfigProperty) => {
        let existingConfig = configProperty.findIndex(property => property.name === e.name);
        if (existingConfig > -1) {
            configProperty[existingConfig].value = e.value;
        } else {
            configProperty.push(e);
        }
        setConfigProperty(configProperty);
        console.log(configProperty);
        configProperties.properties = configProperty;
        props.setConfigs(configProperties);
    }

    return (
        <div className="ConfigElements">
            {
                props.elements.map((element: ConfigProperty, index: number) => {
                    return (
                        <ConfigElement
                            id={props.moduleName + index}
                            name={element.name}
                            type={element.type}
                            description={element.description}
                            required={element.required}
                            moduleName={props.moduleName}
                            value={element.value}
                            setConfigValue={(value: ConfigProperty) => handleSetConfig(value)}
                        />
                    );
                })
            }
        </div>
    );
}
  
export default ConfigElements;
