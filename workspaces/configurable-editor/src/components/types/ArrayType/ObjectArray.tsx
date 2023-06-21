/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
import MenuSelectedIcon from "../../elements/MenuSelectedIcon";
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
    const { isLowCode, isInsideArray, isFeaturePreview, connectionConfig, isRequired } = props;
    const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
    const [connectionAnchorEl, setConnectionAnchorEl] =
        React.useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);
    const textId = open ? "simple-popover" : undefined;
    const connectionOpen = Boolean(connectionAnchorEl);
    const connectionId = open ? "simple-popover" : undefined;
    const [openElement, setOpenElement] = React.useState(true);
    const [openPopover, setOpenPopover] = React.useState(true);
    const [selectedIndex, setSelectedIndex] = React.useState("");

    const [selectedValue, setSelectedValue] = useState(props.value);
    const [arrayValue, setArrayValue] = useState(props.value);
    const [selectedValueRef, setSelectedValueRef] = useState(props.valueRef);
    const [isOpenCollapse, setIsOpenCollapse] = useState<number | null>(null);

    const handleOpen = (clickedIndex: number) => {
        if (isOpenCollapse === clickedIndex) {
            setIsOpenCollapse(null);
        } else {
            setIsOpenCollapse(clickedIndex);
        }
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
        if (!!connectionConfig || connectionConfig.length) {
            setIsOpenCollapse(0);
            setConnectionAnchorEl(connectionEvent.currentTarget);
        } else {
            setAnchorEl(null);
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
    // tslint:disable: jsx-no-lambda jsx-no-multiline-js
    const onSelected = (index: string, mappingName: string, valueReference: string,
                        valueType: string, connectionName: string) => () => {
            setSelectedIndex(connectionName.concat(index));
            setSelectedValue(mappingName);
            setSelectedValueRef(valueReference);
            setConnectionAnchorEl(null);
        };

    const getConnection = connectionConfig?.map((connections, index) => {
        return (
            <Box key={index} className={classes.accordionBox}>
                <ListItem
                    button={true}
                    className={classes.accordion}
                    key={index}
                    onClick={() => handleOpen(index)}
                    disableGutters={true}
                >
                    {isOpenCollapse === index ? (
                        <ExpandLess fontSize="small" />
                    ) : (
                        <ExpandMore fontSize="small" />
                    )}
                    <Typography className={classes.heading} key={index}>
                        {connections.name}
                    </Typography>
                </ListItem>
                <Collapse
                    in={isOpenCollapse === index}
                    timeout="auto"
                    unmountOnExit={true}
                >
                    <List component="div" disablePadding={true}>
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
                                    <MenuItem
                                        key={sIndex}
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
                                            connectionFields.valueType,
                                            connections.name,
                                        )}
                                        selected={connections.name.concat(connectionFields.configKey) === selectedIndex}
                                    >
                                        <Box display="flex" width={1}>
                                            <Box
                                                className={classes.connectionField}
                                            >
                                                <Typography
                                                    className={classes.itemText}
                                                    key={sIndex}
                                                >
                                                    {connectionFields.configKey.split(".").pop() +
                                                        ":"}
                                                </Typography>
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
                                            {
                                                connections.name.concat(connectionFields.configKey) === selectedIndex
                                                &&   <MenuSelectedIcon />
                                            }
                                        </Box>
                                    </MenuItem>
                                );
                            },
                        )}
                    </List>
                </Collapse>
            </Box>
        );
    });

    function iconButtonWithToolTip() {
        if (!connectionConfig || !connectionConfig.length) {
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
                        disabled={!connectionConfig || !connectionConfig.length}
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
                disabled={!connectionConfig || !connectionConfig.length}
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
                            required={isRequired}
                            margin="none"
                            placeholder={"Select config or Add values"}
                            data-cyid={name}
                            aria-describedby={textId}
                            onClick={handleClick}
                            value={selectedValue !== "[ undefined ]" ? selectedValue : undefined}
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
