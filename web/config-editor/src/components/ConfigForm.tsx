import { Box, Button, Card, CardActionArea, CardActions, CardContent, Container, Typography } from "@material-ui/core";
import React from "react";
import { useState } from "react";
import configJsonSchema from "../assets/sampleJsonSchema.json";
import ConfigElements from "./ConfigElements";

enum ConfigType {
    Integer = 'integer',
    String = 'string',
    Float = 'float',
    Boolean = 'boolean'
  }

export type ConfigProperty = {
    id: string,
    name: string,
    type: ConfigType,
    description: string,
    required: boolean,
    value?: string
}

export type ConfigProperties = {
    moduleName: string,
    properties: ConfigProperty[]
}

let schemaProperties: any;
let projectProperties: any;
let packageProperties: any;
let requiredProperties: any;
let moduleProperties: any;
let allProperties: any;
let configProperties: ConfigProperties[] = [];

Object.keys(configJsonSchema).forEach(key => {
    if (key === 'properties') {
        schemaProperties = configJsonSchema[key];
    }
});

Object.keys(schemaProperties).forEach(key => {
    if (key !== '' || key !== undefined) {
        projectProperties = schemaProperties[key].properties;
    }
});

Object.keys(projectProperties).forEach(key => {
    if (key !== '' || key !== undefined) {
        packageProperties = projectProperties[key];
    }
});

Object.keys(packageProperties).forEach(key => {
    if (key === 'required') {
        requiredProperties = packageProperties[key];
    }
    if (key === 'properties') {
        allProperties = packageProperties[key];
    }
});

Object.keys(allProperties).forEach(key => {
    if (isUserDefinedModule(allProperties[key])) {
        moduleProperties = allProperties[key].properties;
        Object.keys(moduleProperties).forEach(moduleKey => {
            addConfig(moduleProperties[moduleKey], key, moduleKey);
        });
    } else {
        addConfig(allProperties[key], 'default', key);
    }
});

function addConfig(propertyObj: any, moduleName: string, configName: string) {
    let isRequired = false;
    if (requiredProperties!) {
        requiredProperties.forEach((element: any) => {
            if (configName === element) {
                isRequired = true;
            }
        });
    }

    let moduleEntry = configProperties.findIndex(e => e.moduleName === moduleName);
    let config: ConfigProperty = {
        id: moduleName + "-" + configName,
        name: configName,
        type: propertyObj['type'],
        description: propertyObj['description'],
        required: isRequired
    }

    if (configProperties[moduleEntry] !== undefined) {
        configProperties[moduleEntry].properties.push(config);
    } else {
        configProperties.push({ moduleName: moduleName, properties: [config]});
    }
}

function isUserDefinedModule(propertyObj: any): boolean {
    let isModule = false;
    Object.keys(propertyObj).forEach(key => {
        if (key === 'properties') {
            isModule = true;
        }
    });
    return isModule;
}

export const ConfigForm = (props: any) => {
    let configSchema = props.configSchema;
    const [configs, setConfigs] = useState(new Array<ConfigProperties>());

    // TODO: Updating the form with existing config values

    const handleSubmit = (event: any) => {
        event.preventDefault();
        console.log("Final" + JSON.stringify(configs));
        return JSON.stringify(configs);
    }

    const handleSetConfigs = (e: ConfigProperties) => {
        let existingConfig = configs.findIndex(property => property.moduleName === e.moduleName);
        if (existingConfig > -1) {
            configs[existingConfig].properties = e.properties;
        } else {
            configs.push(e);
        }
        setConfigs(configs);
    }

    return (
        <Container maxWidth="sm">
            <Card variant="outlined">
                <CardActionArea disableRipple>
                    <CardContent>
                        <Box m={2} pt={3} style={{textAlign: "center"}}>
                            <Typography gutterBottom variant="h5" component="div">
                                Configurable Editor
                            </Typography>
                        </Box>
                        <Typography variant="body2">
                            <form className="ConfigForm" onSubmit={handleSubmit}>
                                {configProperties.map((configProperty: ConfigProperties, index: number) => {
                                    return (
                                        <div>
                                            <Box m={2} pt={3}>
                                                <h3>Module: <span style={{ fontFamily: "Verdana", color: "#3f51b5" }}>{configProperty.moduleName}</span></h3>
                                                <ConfigElements
                                                    key={index}
                                                    elements={configProperty.properties}
                                                    moduleName={configProperty.moduleName}
                                                    setConfigs={(value: ConfigProperties) => handleSetConfigs(value)}
                                                />
                                            </Box>
                                        </div>
                                    );
                                })}
                                <CardActions style={{ justifyContent: 'center' }}>
                                    <Box m={2} pt={3} mb={6}>
                                        <Button variant="contained" color="primary" type="submit">Save Configurations</Button>
                                    </Box>
                                </CardActions>
                            </form>
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Container>
    );
}

export default ConfigForm;
