/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React, { SyntheticEvent } from "react";

import { FormHelperText, MenuItem, Select } from "@material-ui/core";
import AddRounded from "@material-ui/icons/AddRounded";
import classNames from "classnames";

import { useStyles as useFormStyles } from "../../../forms/style";
import { FormElementProps } from "../../../types";
import { LinkButton } from "../../Button/LinkButton";
import { TooltipIcon } from "../../../../../../../components/Tooltip";
import { useStyles as useTextInputStyles } from "../style";

export interface SelectDropdownProps {
    values?: string[];
    disableCreateNew?: boolean;
    optional?: boolean;
    className?: string;
    clearSelection?: boolean;
    onOpenSelect?: () => void;
    onCloseSelect?: () => void;
    tooltipTitle?: any;
    tooltipActionText?: string;
    tooltipActionLink?: string;
    interactive?: boolean;
}

export function SelectDropdownWithButton(props: FormElementProps<SelectDropdownProps>) {
    const formClasses = useFormStyles();
    const dropDownClasses = useTextInputStyles();
    const textFieldClasses = useTextInputStyles();
    const { onChange, onClick, defaultValue, label, placeholder, customProps = {} } = props;
    const { values, disableCreateNew, optional, className,
            clearSelection, onOpenSelect, onCloseSelect } = customProps;

    const [connector, setConnector] = React.useState(defaultValue);

    const handleChange = (event: any) => {
        setConnector(event.target.value);
        if (onChange && event.target.value) {
            onChange(event.target.value);
        }
    };

    const handleCreateNewClick = () => {
        if (onClick) {
            onClick();
        }
    };

    const menuItems: React.ReactNode[] = [];
    if (values) {
        const items: string[] = values;
        items.forEach((value) => {
            menuItems.push(
                <MenuItem key={value} value={value} className={`product-tour-payload-${value.toLowerCase()}`}>
                    <span className="TextSpan">{value}</span>
                </MenuItem>
            );
        });
    }

    React.useEffect(() => {
        setConnector(defaultValue);
    }, [defaultValue]);

    if (clearSelection) {
        setConnector("");
        customProps.clearSelection = false;
    }

    const  preventDiagramScrolling = (e: SyntheticEvent) => {
        e.stopPropagation();
    }

    return (
        <>
            {label ?
                (customProps && optional ?
                        (
                            <div className={textFieldClasses.selectOperationTextWrapper}>
                            <div className={formClasses.labelWrapper}>
                                <FormHelperText className={formClasses.inputLabelForRequired}>{label}</FormHelperText>
                                <FormHelperText className={formClasses.optionalLabel}>Optional</FormHelperText>
                            </div>
                            {customProps?.tooltipTitle  &&
                                (
                                    <div>
                                    <TooltipIcon
                                        title={customProps?.tooltipTitle}
                                        interactive={customProps?.interactive || true}
                                        actionText={customProps?.tooltipActionText}
                                        actionLink={customProps?.tooltipActionLink}
                                        arrow={true}
                                    />
                                    </div>
                                )
                            }
                            </div>
                        ) : (
                            <div className={textFieldClasses.selectOperationTextWrapper}>
                            <div className={formClasses.labelWrapper}>
                                <FormHelperText className={formClasses.inputLabelForRequired}>{label}</FormHelperText>
                                <FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>
                            </div>
                            {customProps?.tooltipTitle  &&
                                (
                                    <div>
                                    <TooltipIcon
                                        title={customProps?.tooltipTitle}
                                        interactive={customProps?.interactive || true}
                                        actionText={customProps?.tooltipActionText}
                                        actionLink={customProps?.tooltipActionLink}
                                        arrow={true}
                                    />
                                    </div>
                                )
                            }
                            </div>
                        )
                ) : null
            }

            <Select
                data-testid={placeholder + values[0]}
                value={connector}
                disableUnderline={true}
                onChange={handleChange}
                onOpen={onOpenSelect}
                onWheel={preventDiagramScrolling}
                onClose={onCloseSelect}
                displayEmpty={true}
                disabled={!(values?.length > 0)}
                className={classNames(dropDownClasses.selectDropDownSm, className)}
                inputProps={{ 'aria-label': 'Without label' }}
                MenuProps={{
                    getContentAnchorEl: null,
                    classes: { paper: dropDownClasses.dropdownStyle },
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                    }
                }}
            >
                {
                    values?.length > 0 ? (
                        <MenuItem value="" disabled={true}>
                            <span className="TextSpan">{placeholder ? placeholder : "Select"}</span>
                        </MenuItem>
                    ) : (
                        <MenuItem value="" disabled={true}>
                            <span className="TextSpan">No Items to Select</span>
                        </MenuItem>
                    )
                }
                {...menuItems}
                {!disableCreateNew && <LinkButton onClick={handleCreateNewClick} startIcon={<AddRounded/>} text="Create New" />}
            </Select>
        </>
    );
}
