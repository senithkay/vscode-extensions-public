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
import { ConfigElementProps } from "../../ConfigElement";
import { AddInputButton } from "../../elements/AddInputButton";
import DeleteButton from "../../elements/DeleteButton";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import PopOverComponent, {
    PopOverComponentProps,
} from "../../elements/PopOverComponent";
import { SchemaConstants } from "../../model";
import { useStyles } from "../../style";
import { getConfigProperties, getRecordName } from "../../utils";
import ObjectType, { ObjectTypeProps } from "../ObjectType";

import { ArrayTypeProps } from ".";
export interface ObjectArrayProps extends ArrayTypeProps {
    values?: any[];
    setArrayElement?: (id: string, objectArrayValue: any) => void;
}

const ObjectArray = (props: ObjectArrayProps): ReactElement => {
    const classes = useStyles();
    const returnElement: ReactElement[] = [];
    const [arrayValues, setArrayValues] = useState<ConfigElementProps[]>([]);
    const [counter, setCounter] = useState(arrayValues.length + 1);
    const isLowCode = props.isLowCode;
    const isInsideArray = props.isInsideArray;
    const isFeaturePreview = props.isFeaturePreview;
    const connectionConfigs = props.connectionConfig;
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
    const [arrayValue, setArrayValue] = useState(props.value);
    const [selectedValueRef, setSelectedValueRef] = useState(props.valueRef);
    const [openConnection, setOpenConnection] = React.useState(true);

    const handleClickOpenConnection = () => {
        setOpenConnection(!openConnection);
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleValueAdd = () => {
        setSelectedValue(arrayValue);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleConnectionClick = (
        connectionEvent: React.MouseEvent<HTMLButtonElement>,
    ) => {
        if (connectionConfigs.length > 0) {
            setConnectionAnchorEl(connectionEvent.currentTarget);
        }
    };

    const handleConnectionClose = () => {
        setConnectionAnchorEl(null);
    };

    const elementSchema: object[] = props.schema[SchemaConstants.ITEMS];

    const element: ConfigElementProps = {
        arrayType: props.arrayType,
        description: props.description,
        id: props.id,
        isFeaturePreview: props.isFeaturePreview,
        isInsideArray: true,
        isLowCode: props.isLowCode,
        isRequired: props.isRequired,
        name: props.name,
        type: props.type,
    };

    useEffect(() => {
        props.setArrayElement(props.id, element);
        if (props.value) {
            const initialValue: ConfigElementProps[] = [];
            let newCounter = counter;
            let configProperties: ConfigElementProps[];
            if (elementSchema[SchemaConstants.PROPERTIES]) {
                configProperties = getConfigProperties(
                    elementSchema,
                    props.connectionConfig,
                    props.isFeaturePreview,
                    props.isLowCode,
                    props.id + "-" + newCounter,
                ).properties;
            }
            Object.keys(props.value).forEach((key) => {
                const objectArrayProps: ObjectArrayProps = {
                    description: props.schema[SchemaConstants.DESCRIPTION],
                    id: props.id + "-" + newCounter,
                    isFeaturePreview: props.isFeaturePreview,
                    isInsideArray: true,
                    isLowCode: props.isLowCode,
                    isRequired: true,
                    name: "",
                    properties: configProperties,
                    schema: elementSchema,
                    type: props.arrayType,
                    value: props.value[key],
                };
                newCounter = newCounter + 1;
                initialValue.push(objectArrayProps);
            });
            setCounter(newCounter);
            setArrayValues(initialValue);
        }
    }, []);

    const addArrayElememt = () => {
        let propertiesValue: ConfigElementProps[];
        if (elementSchema[SchemaConstants.PROPERTIES]) {
            propertiesValue = getConfigProperties(
                elementSchema,
                props.connectionConfig,
                props.isFeaturePreview,
                props.isLowCode,
                props.id + "-" + counter,
            ).properties;
        }
        const objectArrayProps: ObjectArrayProps = {
            description: props.schema[SchemaConstants.DESCRIPTION],
            id: props.id + "-" + counter,
            isFeaturePreview: props.isFeaturePreview,
            isLowCode: props.isLowCode,
            isRequired: true,
            name: "",
            properties: propertiesValue,
            schema: elementSchema,
            type: props.arrayType,
        };
        setCounter((prevState) => prevState + 1);
        setArrayValues((prevState) => [...prevState, objectArrayProps]);
    };

    const removeArrayElement = (id: string) => {
        let newArrayValues = [...arrayValues];
        newArrayValues = newArrayValues.filter((arrayElement) => {
            return arrayElement.id !== id;
        });
        setArrayValues(newArrayValues);
    };

    const handleValueChange = (id: string, value: any) => {
        const newArrayValues = [...arrayValues];
        const existingMap = newArrayValues.findIndex(
            (property) => property.id === id,
        );
        if (existingMap > -1) {
            newArrayValues[existingMap] = value;
        }
        setArrayValues(newArrayValues);
    };

    useEffect(() => {
        let fullValue = "[ ";
        for (const key in arrayValue) {
            if (arrayValue.hasOwnProperty(key)) {
                key === "0"
                    ? (fullValue = fullValue + arrayValue[key])
                    : (fullValue = fullValue + ", " + arrayValue[key]);
            }
        }
        fullValue = fullValue + " ]";
        setSelectedValue(fullValue);
    }, [selectedValue]);

    useEffect(() => {
        let fullValue = "[ ";
        for (const key in arrayValue) {
            if (arrayValue.hasOwnProperty(key)) {
                key === "0"
                    ? (fullValue = fullValue + arrayValue[key])
                    : (fullValue = fullValue + ", " + arrayValue[key]);
            }
        }
        fullValue = fullValue + " ]";
        setSelectedValue(fullValue);
    }, [props.value]);

    useEffect(() => {
        const newArrayValues: ConfigElementProps[] = [];
        arrayValues.forEach((entry) => {
            if (entry.properties !== undefined && entry.properties.length > 0) {
                entry.value = undefined;
            }
            newArrayValues.push(entry);
        });
        element.value = newArrayValues;
        setArrayValue(newArrayValues);
        props.setArrayElement(props.id, element);
    }, [arrayValues]);

    arrayValues.forEach((arrayElement) => {
        const objectTypeProps: ObjectTypeProps = {
            ...arrayElement,
            setObjectConfig: handleValueChange,
        };

        returnElement.push(
            (
                <Box key={arrayElement.id} display="flex">
                    <Box key={arrayElement.id + "-ENTRY"} flexGrow={1}>
                        <ObjectType {...objectTypeProps} />
                    </Box>
                    <Box pt={1}>
                        <DeleteButton
                            onDelete={removeArrayElement}
                            id={arrayElement.id}
                        />
                    </Box>
                </Box>
            ),
        );
    });

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
                                                        label={connectionFields.valueType} />
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

    const iconButton = (
        <Box>
            <IconButton
                size={"small"}
                className={classes.buttonConnections}
                data-toggle="tooltip"
                data-placement="top"
                onClick={handleConnectionClick}
            >
                <SelectIcon />
            </IconButton>
        </Box>
    );

    const popOverComponent = (
        <PopOverComponent
            id={textId}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            onValueAdd={handleValueAdd}
            returnElement={returnElement}
            addArrayElememt={addArrayElememt}
        />
    );

    const typeLabel: string =
        props.schema[SchemaConstants.ITEMS][SchemaConstants.NAME];
    const { fullRecordName, shortenedRecordName } = getRecordName(typeLabel);
    const fieldLabelProps: FieldLabelProps = {
        description: props.description,
        name: props.name,
        required: props.isRequired,
        shortenedType:
            (shortenedRecordName ? shortenedRecordName : "map") + " [ ]",
        type: (fullRecordName ? fullRecordName : "map") + " [ ]",
    };

    return (
        <Box mb={2}>
            <Box display="flex" flexDirection="column">
                <Box mb={0.5}>
                    <FieldLabel {...fieldLabelProps} />
                </Box>
                <Box
                    display="flex"
                    gridGap={4}
                    alignItems="center"
                >
                    <Box flexGrow={1}>
                        <TextInput
                            fullWidth={true}
                            margin="none"
                            placeholder={"Select config or Add values"}
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
                        <Typography className={classes.popOver}>
                            {getConnection}
                        </Typography>
                    </Box>
                </Popover>
                {popOverComponent}
            </Box>
        </Box>
    );
};

export default ObjectArray;
