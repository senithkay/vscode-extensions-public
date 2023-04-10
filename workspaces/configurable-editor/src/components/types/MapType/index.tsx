/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { ReactElement, useEffect, useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Popover,
    TextField,
    Tooltip,
    Typography,
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

import { SelectIcon } from "../../../assets/icons";
import Chip from "../../ChoreoSystem/Chip/Chip";
import TextInput from "../../ChoreoSystem/TextInput/TextInput";
import { AddInputButton } from "../../elements/AddInputButton";
import DeleteButton from "../../elements/DeleteButton";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import PopOverComponent, {
    PopOverComponentProps,
} from "../../elements/PopOverComponent";
import { TextFieldInput } from "../../elements/TextFieldInput";
import MapConfigElement, {
    MapConfigElementProps,
} from "../../MapConfigElement";
import { ConfigType, SchemaConstants } from "../../model";
import { useStyles } from "../../style";
import { getConfigProperties } from "../../utils";
import { ObjectTypeProps } from "../ObjectType";

/**
 * A high level config property which can contain configurable maps.
 */
export interface MapTypeProps extends ObjectTypeProps {
    setConfigMap: (id: string, mapValue: any) => void;
}

export const MapType = (props: MapTypeProps): ReactElement => {
    const [mapValues, setMapValues] = useState<MapConfigElementProps[]>([]);
    const [counter, setCounter] = useState(1);
    const classes = useStyles();
    const isLowCode = props.isLowCode;
    const isInsideArray = props.isInsideArray;
    const isFeaturePreview = props.isFeaturePreview;
    const connectionConfigs = props.connectionConfig;
    const isRequired = props.isRequired;
    const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
    const [connectionAnchorEl, setConnectionAnchorEl] =
        React.useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);
    const textId = open ? "simple-popover" : undefined;
    const connectionOpen = Boolean(connectionAnchorEl);
    const connectionId = open ? "simple-popover" : undefined;
    const [openElement, setOpenElement] = React.useState(true);
    const [openPopover, setOpenPopover] = React.useState(true);

    const [selectedValue, setSelectedValue] = useState(props.value);
    const [selectedValueRef, setSelectedValueRef] = useState(props.valueRef);
    const [openConnection, setOpenConnection] = React.useState(true);
    const handleClickOpenConnection = () => {
        setOpenConnection(!openConnection);
    };

    const elementSchema: object[] =
        props.schema[SchemaConstants.ADDITIONAL_PROPERTIES];
    let propertyType = elementSchema[SchemaConstants.TYPE];

    let propertiesValue: MapConfigElementProps[];
    if (elementSchema[SchemaConstants.PROPERTIES] !== undefined) {
        propertiesValue = getConfigProperties(
            elementSchema,
            props.connectionConfig,
            props.isFeaturePreview,
            props.isLowCode,
            props.id + "-" + counter,
        ).properties;
    } else if (elementSchema[SchemaConstants.ANY_OF] !== undefined) {
        propertyType = ConfigType.ANY_OF;
    }

    const element: MapConfigElementProps = {
        description: props.description,
        id: props.id,
        isRequired: props.isRequired,
        name: props.name,
        properties: [],
        schema: propertiesValue ? elementSchema : props.schema,
        type: props.type,
        value: props.value,
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleConnectionClick = (connectionEvent: React.MouseEvent<HTMLButtonElement>) => {
        if (connectionConfigs.length > 0) {
            setConnectionAnchorEl(connectionEvent.currentTarget);
        }
    };

    const handleConnectionClose = () => {
        setConnectionAnchorEl(null);
    };

    useEffect(() => {
        props.setConfigMap(props.id, element);
        if (props.value) {
            const initialValue: MapConfigElementProps[] = [];
            let newCounter = counter;
            Object.keys(props.value).forEach((key) => {
                const configElementProps: MapConfigElementProps = {
                    description: elementSchema[SchemaConstants.DESCRIPTION],
                    id: props.id + "-" + newCounter,
                    isInsideArray: true,
                    isRequired: false,
                    label: "value",
                    name: key,
                    properties: propertiesValue,
                    schema: propertiesValue ? elementSchema : props.schema,
                    type: propertyType,
                    value: props.value[key],
                };
                newCounter = newCounter + 1;
                initialValue.push(configElementProps);
            });
            setCounter(newCounter);
            setMapValues(initialValue);
        }
    }, []);

    useEffect(() => {
        let fullValue = "";
        for (const key in mapValues) {
            if (mapValues.hasOwnProperty(key)) {
                key === "0" ? fullValue = fullValue + "{" + mapValues[key].name + " : " + mapValues[key].value + "}" :
                fullValue = fullValue + ", " + "{" + mapValues[key].name + " : " + mapValues[key].value + "}";
            }
        }
        fullValue = fullValue + "";
        setSelectedValue(fullValue);
    }, [selectedValue]);

    const addMapField = () => {
        const configElementProps: MapConfigElementProps = {
            description: elementSchema[SchemaConstants.DESCRIPTION],
            id: props.id + "-" + counter,
            isRequired: true,
            label: "value",
            name: "",
            properties: propertiesValue,
            schema: propertiesValue ? elementSchema : props.schema,
            type: propertyType,
        };
        setCounter((prevState) => prevState + 1);
        setMapValues([...mapValues, configElementProps]);
    };

    const removeMapField = (id: string) => {
        let newMapValues = [...mapValues];
        newMapValues = newMapValues.filter((entry) => {
            return entry.id !== id;
        });
        setMapValues(newMapValues);
    };

    const handleValueChange = (id: string, value: any) => {
        const newMapValues = [...mapValues];
        const existingMap = newMapValues.findIndex(
            (property) => property.id === id,
        );
        if (existingMap > -1) {
            if (newMapValues[existingMap].properties !== undefined) {
                value.name = newMapValues[existingMap].name;
                value.label = "value";
                newMapValues[existingMap] = value;
            } else {
                newMapValues[existingMap].value = value.value;
            }
        }
        setMapValues(newMapValues);
    };

    const handleKeyChange = (id: string, value: string) => {
        const newMapValues = [...mapValues];
        const existingMap = newMapValues.findIndex(
            (property) => property.id === id,
        );
        if (existingMap > -1) {
            newMapValues[existingMap].name = value;
        }
        setMapValues(newMapValues);
    };

    useEffect(() => {
        if (mapValues.length > 0) {
            const newMapValues = [...mapValues];
            newMapValues.forEach((entry) => {
                const configProperty: MapConfigElementProps = {
                    description: entry.description,
                    id: entry.id,
                    isFeaturePreview: props.isFeaturePreview,
                    isLowCode: props.isLowCode,
                    isRequired: entry.isRequired,
                    name: entry.name,
                    properties: entry.properties,
                    type: entry.type,
                    value: entry.properties ? undefined : entry.value,
                };
                const existingMap = element.properties.findIndex(
                    (property) => property.id === entry.id,
                );
                if (existingMap > -1) {
                    element.properties[existingMap] = configProperty;
                } else {
                    element.properties.push(configProperty);
                }
            });
            element.value = undefined;
            props.setConfigMap(props.id, element);
        }
    }, [mapValues]);

    const handleValueAdd = () => {
        setSelectedValue(mapValues);
        setAnchorEl(null);
    };

    const getConfigElements = (configElement: MapConfigElementProps) => {
        configElement.setConfigElement = handleValueChange;
        return (
            <Box key={configElement.id} className={classes.innerBoxCard}>
                <Card variant="outlined">
                    <CardContent>
                        <Box>
                            <Box display="flex" justifyContent="flex-end">
                                <DeleteButton
                                    onDelete={removeMapField}
                                    id={configElement.id}
                                />
                            </Box>
                            <Box key={configElement.id + "-ENTRY"}>
                                <TextFieldInput
                                    id={configElement.id}
                                    isRequired={true}
                                    value={configElement.name}
                                    valueRef={configElement.valueRef}
                                    placeholder="key"
                                    type="string"
                                    setTextFieldValue={handleKeyChange}
                                />
                                <Box mt={2}>
                                    <MapConfigElement {...configElement} />
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    const onSelected =
        (index: string, mappingName: string, valueReference: string) => () => {
            setSelectedValue(mappingName);
            setSelectedValueRef(valueReference);
            setConnectionAnchorEl(null);
        };

    const getConnection = connectionConfigs?.map((connections, index) => {
        return (
            <Box key={index} className={classes.accordionBox}>
                <ListItem button={true} className={classes.accordion}>
                    <ListItemText
                        key={index}
                        primary={connections.name}
                        className={classes.heading}
                        onClick={handleClickOpenConnection}
                    />
                    {openConnection ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                {connections.configurationData.map(
                    (
                        connectionFields: {
                            configKey: string;
                            valueType: string;
                            valueRef: string;
                        },
                        sIndex: React.Key,
                    ) => {
                        return (
                            <Collapse
                                key={sIndex}
                                in={openConnection}
                                timeout="auto"
                                unmountOnExit={true}
                            >
                                <List component="div" disablePadding={true}>
                                    <MenuItem
                                        button={true}
                                        value={connectionFields.configKey}
                                        className={classes.menuItem}
                                        id={
                                            "${" +
                                            connections.name +
                                            "." +
                                            connectionFields.configKey +
                                            "}"
                                        }
                                        onClick={onSelected(
                                            connectionFields.configKey,
                                            "${" +
                                                connections.name +
                                                "." +
                                                connectionFields.configKey +
                                                "}",
                                            connectionFields.valueRef,
                                        )}
                                        title={connectionFields.valueRef}
                                    >
                                        <Box
                                            className={classes.connectionField}
                                        >
                                            <Box>
                                                <ListItemText
                                                    key={sIndex}
                                                    primary={
                                                        connectionFields.configKey.split(".").pop() +
                                                        ":"
                                                    }
                                                />
                                            </Box>
                                            <Box ml={1}>
                                                <Tooltip title={connectionFields.valueType}>
                                                    <Chip
                                                        color="success"
                                                        variant="outlined"
                                                        size="small"
                                                        label={connectionFields.valueType}
                                                    />
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                </List>
                            </Collapse>
                        );
                    },
                )}
            </Box>
        );
    });

    function iconButtonWithToolTip() {
        if (connectionConfigs === undefined || connectionConfigs.length === 0) {
          return (
            <Tooltip title="No global configurations defined. Please contact administrator">
                <span>
                    <IconButton
                        size={"small"}
                        className={classes.buttonConnections}
                        data-toggle="tooltip"
                        data-placement="top"
                        onClick={handleConnectionClick}
                        color={selectedValueRef ? "primary" : "default"}
                        disabled={connectionConfigs ===  undefined || connectionConfigs.length === 0 ? true : false}
                    >
                        <SelectIcon />
                    </IconButton>
                </span>
            </Tooltip>
          );
        }
        return (
            <IconButton
                size={"small"}
                className={classes.buttonConnections}
                data-toggle="tooltip"
                data-placement="top"
                onClick={handleConnectionClick}
                color={selectedValueRef ? "primary" : "default"}
                disabled={connectionConfigs ===  undefined || connectionConfigs.length === 0 ? true : false}
            >
                <SelectIcon />
            </IconButton>
        );
      }

    const iconButton = (
        <Box>
            {iconButtonWithToolTip}
        </Box>
    );

    const popOverComponent = (
        <PopOverComponent
            id={textId}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            returnElement={mapValues.map(getConfigElements)}
            addArrayElememt={addMapField}
            onValueAdd={handleValueAdd}
        />
    );

    const fieldLabelProps: FieldLabelProps = {
        description: props.description,
        label: props.label,
        name: props.name,
        required: props.isRequired,
        shortenedType: "map",
        type: "map",
    };

    return (
        <Box mb={2}>
            <Box display="flex" flexDirection="column">
                <Box mb={0.5}>
                    <FieldLabel {...fieldLabelProps} />
                </Box>
                <Box display="flex" alignItems="center" gridGap={4}>
                    <Box flexGrow={1}>
                        <TextInput
                            fullWidth={true}
                            required={isRequired}
                            margin="none"
                            placeholder={
                                "Select config or Add values"
                            }
                            data-cyid={name}
                            aria-describedby={textId}
                            onClick={handleClick}
                            value={selectedValue}
                        />
                    </Box>
                    {!isInsideArray &&
                        !isLowCode &&
                        !isFeaturePreview &&
                        iconButton}
                </Box>
                <Box>
                    <Popover
                        id={connectionId}
                        open={connectionOpen}
                        anchorEl={connectionAnchorEl}
                        onClose={handleConnectionClose}
                        anchorOrigin={{
                            horizontal: "right",
                            vertical: "bottom",
                        }}
                        transformOrigin={{
                            horizontal: "right",
                            vertical: "top",
                        }}
                        className={classes.popOver}
                    >
                        <Box>
                            <Typography
                                className={classes.popOver}
                            >
                                {getConnection}
                            </Typography>
                        </Box>
                    </Popover>
                </Box>
                <Box>{popOverComponent}</Box>
            </Box>
        </Box>
    );
};

export default MapType;
