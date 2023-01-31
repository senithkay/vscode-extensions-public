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
    Typography,
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

import { SelectIcon, TickIcon } from "../../../assets/icons";
import { ConfigElementProps } from "../../ConfigElement";
import { AddInputButton } from "../../elements/AddInputButton";
import ButtonContainer from "../../elements/ButtonContainer";
import DeleteButton from "../../elements/DeleteButton";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import MenuSelectedIcon from "../../elements/MenuSelectedIcon";
import OutlinedLabel from "../../elements/OutlinedLabel";
import PopOverComponent, {
    PopOverComponentProps,
} from "../../elements/PopOverComponent";
import {
    TextFieldInput,
    TextFieldInputProps,
} from "../../elements/TextFieldInput";
import { ConfigValue, ConnectionSchema } from "../../model";
import { useStyles } from "../../style";
import SimpleType, { SimpleTypeProps } from "../SimpleType";

import { ArrayTypeProps } from ".";

/**
 * The leaf level configurable type representing boolean values.
 */
export interface SimpleArrayProps extends ArrayTypeProps {
    setArrayElement?: (id: string, simpleArrayValue: any) => void;
}

const SimpleArray = (props: SimpleArrayProps): ReactElement => {
    const classes = useStyles();
    const returnElement: ReactElement[] = [];
    const [arrayValues, setArrayValues] = useState<ConfigValue[]>(
        getInitialValues(props.value, props.id),
    );
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

    const [selectedIndex, setSelectedIndex] = React.useState("");
    const [selectedValue, setSelectedValue] = useState(props.value);
    const [selectedValue2, setSelectedValue2] = useState(props.value);
    const [arrayValue, setArrayValue] = useState(props.value);
    const [selectedValueRef, setSelectedValueRef] = useState(props.valueRef);
    const [openConnection, setOpenConnection] = React.useState(true);
    const handleClickOpenConnection = () => {
        setOpenConnection(!openConnection);
    };

    const element: ConfigElementProps = {
        arrayType: props.arrayType,
        description: props.description,
        id: props.id,
        isRequired: props.isRequired,
        name: props.name,
        schema: props.schema,
        type: props.type,
        value: props.value,
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleValueAdd = () => {
        setSelectedValue(arrayValue);
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

    const addArrayElememt = () => {
        const configValue: ConfigValue = {
            key: props.id + "-" + counter,
            value: undefined,
        };
        setCounter((prevState) => prevState + 1);
        setArrayValues((prevState) => [...prevState, configValue]);
    };

    const removeArrayElement = (id: string) => {
        let newSimpleArray = [...arrayValues];
        newSimpleArray = newSimpleArray.filter((arrayElement) => {
            return arrayElement.key !== id;
        });
        setArrayValues(newSimpleArray);
    };

    const handleValueChange = (id: string, value: any) => {
        const newArrayValues = [...arrayValues];
        const existingMap = newArrayValues.findIndex(
            (property) => property.key === id,
        );
        if (existingMap > -1) {
            newArrayValues[existingMap].value = value.value;
        }
        setArrayValues(newArrayValues);
    };

    useEffect(() => {
        setSelectedValue2(selectedValue2);
    }, [selectedValue2]);

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
        setSelectedValue2(fullValue);
    }, [selectedValue]);

    useEffect(() => {
        const values: any[] = [];
        arrayValues.forEach((entry) => {
            values.push(entry.value);
        });
        element.value = values;
        setArrayValue(values);
        props.setArrayElement(props.id, element);
    }, [arrayValues]);

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

    arrayValues.forEach((arrayElement) => {
        const simpleTypeProps: SimpleTypeProps = {
            ...props,
            id: arrayElement.key,
            isInsideArray: true,
            setSimpleConfig: handleValueChange,
            type: props.arrayType,
            value: arrayElement.value,
        };
        returnElement.push(
            (
                <Box
                    key={arrayElement.key}
                    display="flex"
                    alignItems="center"
                    mb={2}
                    gridGap={8}
                >
                    <Box flexGrow={1}>
                        <SimpleType {...simpleTypeProps} />
                    </Box>
                    <Box>
                        <DeleteButton
                            onDelete={removeArrayElement}
                            id={arrayElement.key}
                        />
                    </Box>
                </Box>
            ),
        );
    });

    const onSelected = (index: string, mappingName: string, valueReference: string,
                        valueType: string, connectionName: string) => () => {
            setSelectedIndex(connectionName.concat(index));
            setSelectedValue2(mappingName);
            setSelectedValueRef(valueReference);
            setConnectionAnchorEl(null);
        };

    const fieldLabelProps: FieldLabelProps = {
        description: props.description,
        name: props.name,
        required: props.isRequired,
        shortenedType: props.arrayType + " [ ]",
        type: props.arrayType + " [ ]",
    };

    const getConnection = connectionConfigs?.map((connections, index) => {
        return (
            <Box key={index} className={classes.accordionBox}>
                <ListItem
                    button={true}
                    className={classes.accordion}
                    onClick={handleClickOpenConnection}
                    disableGutters={true}
                >
                    {openConnection ? (
                        <ExpandLess fontSize="small" />
                    ) : (
                        <ExpandMore fontSize="small" />
                    )}
                    <Typography className={classes.heading} key={index}>
                        {connections.name}
                    </Typography>
                </ListItem>
                <Collapse
                    in={openConnection}
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
                                                <OutlinedLabel
                                                    type="default"
                                                    label={
                                                        connectionFields.valueType
                                                    }
                                                    tooltipText={
                                                        connectionFields.valueType
                                                    }
                                                    shape="none"
                                                />
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

    const iconButton = (
        <Box>
            <IconButton
                size="small"
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

    return (
        <Box mb={2}>
            <Box display="flex" alignItems="center">
                <Box flex="0 0 150px">
                    <FieldLabel {...fieldLabelProps} />
                </Box>
                <Box
                    flexGrow={1}
                    display="flex"
                    gridGap={4}
                    alignItems="center"
                >
                    <Box flexGrow={1}>
                        <TextField
                            variant="outlined"
                            fullWidth={true}
                            margin="none"
                            size="small"
                            classes={{ root: classes.textInputRoot }}
                            placeholder={"Select config or Add values"}
                            InputLabelProps={{ shrink: false }}
                            data-cyid={name}
                            aria-describedby={textId}
                            onClick={handleClick}
                            value={selectedValue2}
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

export default SimpleArray;

function getInitialValues(values: any[], id: string): ConfigValue[] {
    const arrayValues: ConfigValue[] = [];
    if (values) {
        values.forEach((element, index) => {
            arrayValues.push({
                key: id + "-" + (index + 1),
                value: element,
            });
        });
    }
    return arrayValues;
}
