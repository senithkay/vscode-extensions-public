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
    Checkbox,
    Collapse,
    FormControlLabel,
    Grid,
    IconButton,
    Link,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Popover,
    Tooltip,
    Typography,
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

import { EditIcon, SelectIcon } from "../../../assets/icons";
import Chip from "../../ChoreoSystem/Chip/Chip";
import MenuSelectedIcon from "../../elements/MenuSelectedIcon";
import { TextFieldInput, TextFieldInputProps } from "../../elements/TextFieldInput";
import { ConnectionSchema } from "../../model";
import { useStyles } from "../../style";
import { SimpleTypeProps } from "../SimpleType";

/**
 * The leaf level configurable type representing string values.
 */
export interface StringTypeProps extends SimpleTypeProps {
    connectionConfig?: ConnectionSchema[];
    value?: string;
    valueRef?: string;
    isSensitive?: boolean;
    setStringType: (
        id: string,
        stringValue: string,
        valueReference: string,
    ) => void;
    isInsideArray?: boolean;
    isLowCode?: boolean;
    isFeaturePreview?: boolean;
    isSensitiveValue?: boolean;
}

const StringType = (props: StringTypeProps): ReactElement => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const isInsideArray = props.isInsideArray;
    const isLowCode = props.isLowCode;
    const isFeaturePreview = props.isFeaturePreview;

    const connectionConfigs = props.connectionConfig;
    const classes = useStyles();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (connectionConfigs.length !== 0) {
            setIsOpenCollapse(0);
            setAnchorEl(event.currentTarget);
        } else {
            setAnchorEl(null);
        }
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const ids = open ? "simple-popover" : undefined;

    const [isSensitive, setIsSensitive] = React.useState(props.isSensitive);
    const [isMarkedSensitive, setIsMarkedSensitive] = React.useState(props.isSensitive ? props.isSensitive : false);
    const [selectedIndex, setSelectedIndex] = React.useState("");
    const [selectedValue, setSelectedValue] = useState(props.isSensitive ? undefined : props.value);
    const [selectedValueRef, setSelectedValueRef] = useState(props.isSensitive ? undefined : props.valueRef);
    const [openConnection, setOpenConnection] = React.useState(true);
    const [textInputDisabledState, setTextInputDisabledState] = React.useState(false);
    const handleClickOpenConnection = () => {
        setOpenConnection(!openConnection);
    };

    useEffect(() => {
        if (selectedValueRef !== "" && selectedValueRef !== undefined) {
            setTextInputDisabledState(true);
            setSelectedIndex(selectedValue.substring(selectedValue.indexOf(".") + 1).replace("}", ""));
        }
        if (connectionConfigs === undefined || connectionConfigs.length === 0) {
            setTextInputDisabledState(false);
        }
        if (props.isSensitive) {
            setSelectedValue(undefined);
            setSelectedValueRef(undefined);
        }
    }, []);

    useEffect(() => {
        if (isSensitive) {
            setSelectedValue(undefined);
            setSelectedValueRef(undefined);
        }
    }, [selectedValue]);

    // tslint:disable: jsx-no-lambda jsx-no-multiline-js
    const onSelected =
        (index: string, mappingName: string, valueReference: string, valueType: string) => () => {
            if (valueType === "string") {
                if (selectedValueRef === valueReference) {
                    setSelectedValueRef("");
                    setSelectedValue("");
                    setSelectedIndex("");
                    setTextInputDisabledState(false);
                    setAnchorEl(null);
                } else {
                    setSelectedValue(mappingName);
                    setSelectedValueRef(valueReference);
                    setSelectedIndex(index);
                    setTextInputDisabledState(true);
                    setAnchorEl(null);
                }
            } else {
                setAnchorEl(null);
            }
        };

    const returnElement: ReactElement[] = [];
    const { id, isRequired, value, setStringType, placeholder, name } = props;

    const textFieldInputProps: TextFieldInputProps = {
        id,
        isRequired,
        name,
        placeholder,
        setTextFieldValue: setStringType,
        type: "text",
        value,
    };

    const [isOpenCollapse, setIsOpenCollapse] = useState(null);

    const handleOpen = (clickedIndex: number) => {
        if (isOpenCollapse === clickedIndex) {
            setIsOpenCollapse(null);
        } else {
            setIsOpenCollapse(clickedIndex);
        }
    };

    const handleClickSensitive = () => {
        setIsSensitive(false);
        setIsMarkedSensitive(false);
    };

    const handleChange = () => {
        setIsMarkedSensitive(!isMarkedSensitive);
    };

    const getConnection = connectionConfigs?.map((connections, index) => {
        return (
            <Box key={index} className={classes.accordionBox}>
                <ListItem button={true} className={classes.accordion} key={index} onClick={() => handleOpen(index)}>
                    {isOpenCollapse === index ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
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
                                in={isOpenCollapse === index}
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
                                        disabled={connectionFields.valueType === "string" ? false : true}
                                    >
                                    <Box display="flex" width={1}>
                                        <Box
                                            className={classes.connectionField}
                                        >
                                            <Typography
                                                className={classes.itemText}
                                                key={sIndex}
                                            >
                                                {connectionFields.configKey.split(".").pop() + ":"}
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
                        onClick={handleClick}
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
                onClick={handleClick}
                color={selectedValueRef ? "primary" : "default"}
                disabled={connectionConfigs.length !== 0 ? false : true}
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

    const markSensitiveCheckbox = (
        <Box>
            <FormControlLabel
                control={<Checkbox color={"primary"} />}
                onChange={handleChange}
                label="Mark as Sensitive"
            />
        </Box>
    );

    if (!isSensitive) {
        returnElement.push(
            (
                <div key={id + "-FIELD"}>
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
                                name={name}
                                placeholder={props.isNestedArray ? "Enter comma seperated array" : "Select config or Enter a value"}
                                setTextFieldValue={setStringType}
                                type={isMarkedSensitive ? "password" : "text"}
                                disabled={textInputDisabledState}
                                value={selectedValue}
                                valueRef={selectedValueRef}
                                isSensitiveField={isMarkedSensitive || props.isSensitive}
                            />
                        </Box>
                        {!isInsideArray &&
                            !isLowCode &&
                            iconButton}
                    </Box>
                    {
                        !isLowCode &&
                        isFeaturePreview &&
                        (selectedValueRef === undefined || selectedValueRef === "") &&
                        markSensitiveCheckbox
                    }
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
    } else {
        returnElement.push(
            (
                <div key={id + "-FIELD"}>
                    <Box
                        flexGrow={1}
                        display="flex"
                        gridGap={4}
                        alignItems="center"
                    >
                        <Box flexGrow={1}>
                            <Link
                                component="button"
                                variant="inherit"
                                underline="none"
                                onClick={handleClickSensitive}
                                className={classes.linkStyle}
                            >
                                <EditIcon />
                                <span className={classes.linkTextSytle}>Update Sensitive Content</span>
                            </Link>
                        </Box>
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
    }

    return <>{returnElement}</>;
};

export default StringType;
