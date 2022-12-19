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
    Collapse,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Popover,
    Typography,
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

import { SelectIcon } from "../../../assets/icons";
import MenuSelectedIcon from "../../elements/MenuSelectedIcon";
import OutlinedLabel from "../../elements/OutlinedLabel";
import { TextFieldInput, TextFieldInputProps } from "../../elements/TextFieldInput";
import { ConnectionSchema } from "../../model";
import { useStyles } from "../../style";
import { SimpleTypeProps } from "../SimpleType";

/**
 * The leaf level configurable type representing integer values.
 */
export interface IntegerTypeProps extends SimpleTypeProps {
    connectionConfig?: ConnectionSchema[];
    value?: number;
    valueRef?: string;
    setIntegerConfig: (id: string, intValue: number, valueRef: any) => void;
    isInsideArray?: boolean;
    isLowCode?: boolean;
    isFeaturePreview?: boolean;
}

const IntegerType = (props: IntegerTypeProps): ReactElement => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const isInsideArray = props.isInsideArray;
    const isLowCode = props.isLowCode;
    const isFeaturePreview = props.isFeaturePreview;
    const connectionConfigs = props.connectionConfig;
    const [connectionClick, setConnectionClick] = useState(false);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const ids = open ? "simple-popover" : undefined;
    const classes = useStyles();

    const [openConnection, setOpenConnection] = React.useState(true);
    const [selectedValue, setSelectedValue] = useState<string | number>(props.value);
    const [selectedValueRef, setSelectedValueRef] = useState(props.valueRef);
    const [selectedIndex, setSelectedIndex] = React.useState("");

    const handleClickOpenConnection = () => {
        setOpenConnection(!openConnection);
    };
    const returnElement: ReactElement[] = [];
    const { id, isRequired, value, setIntegerConfig, placeholder } = props;

    const setIntegerValue = (
        propertyId: string,
        propertyValue: number,
        propertyRef: any,
    ) => {
        setIntegerConfig(propertyId, Number(propertyValue), propertyRef);
    };

    const textFieldInputProps: TextFieldInputProps = {
        id,
        isRequired,
        placeholder,
        setTextFieldValue: setIntegerValue,
        type: "number",
        value,
    };

    const onSelected =
        (index: string, mappingName: string, valueReference: string, valueType: string) => () => {
            if (valueType === "int") {
                setConnectionClick(true);
                setSelectedValue(mappingName);
                setSelectedValueRef(valueReference);
                setSelectedIndex(index);
                setAnchorEl(null);
            } else {
                setAnchorEl(null);
            }
        };

    const getConnection = connectionConfigs?.map((connections, index) => {
        return (
            <Box key={index} className={classes.accordionBox}>
                <ListItem button={true} className={classes.accordion}>
                    {openConnection ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                    <ListItemText
                        key={index}
                        primary={connections.name}
                        className={classes.heading}
                        onClick={handleClickOpenConnection}
                    />
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
                                            connectionFields.valueType,
                                        )}
                                        selected={connectionFields.configKey === selectedIndex}
                                    >
                                        <Box display="flex" width={1}>
                                            <Box
                                                className={classes.connectionField}
                                            >
                                                <Typography
                                                    className={classes.itemText}
                                                    key={sIndex}
                                                >
                                                    { connectionFields.configKey.split(".").pop() +
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
                                            connectionFields.configKey === selectedIndex &&   <MenuSelectedIcon />
                                            }
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
                onClick={handleClick}
            >
                <SelectIcon />
            </IconButton>
        </Box>
    );

    returnElement.push(
        (
            <div key={id + "-FIELD"}>
                {/* <TextFieldInput {...textFieldInputProps} /> */}
                <Box
                    flexGrow={1}
                    display="flex"
                    gridGap={4}
                    alignItems="center"
                >
                    <Box flexGrow={1}>
                        <TextFieldInput
                            id={id}
                            isRequired={isRequired}
                            inputProps={
                                connectionClick
                                    ? { inputMode: "text" }
                                    : {
                                        inputMode: "numeric",
                                        pattern: "[-+]?[0-9]",
                                    }
                            }
                            placeholder="Select config or Enter a value"
                            setTextFieldValue={setIntegerConfig}
                            type={connectionClick ? "text" : "number"}
                            value={selectedValue}
                            valueRef={selectedValueRef}
                        />
                    </Box>
                    {!isInsideArray &&
                        !isLowCode &&
                        !isFeaturePreview &&
                        iconButton}
                </Box>
                <Box>
                    <Popover
                        id={ids}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        className={classes.popOver}
                    >
                        <Box>
                            <Typography className={classes.popOver}>
                                {getConnection}
                            </Typography>
                        </Box>
                    </Popover>
                </Box>
            </div>
        ),
    );

    return <>{returnElement}</>;
};

export default IntegerType;
