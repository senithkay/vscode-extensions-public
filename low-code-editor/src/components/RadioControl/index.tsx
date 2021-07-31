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
// tslint:disable: jsx-no-multiline-js no-empty jsx-curly-spacing
import React from "react";

import classNames from "classnames";

import "./style.scss"
import { useStyles } from "./styles";

export default function RadioControl(props: any) {
    const classes = useStyles();
    const { options, selectedValue, onSelect } = props;

    const renderCtrlItem = (opt: string) => {
        const handleOnSelect = () => onSelect(opt)

        return (
            <button
                key={opt}
                className={classNames(classes.radioBtn, selectedValue === opt ? classNames(classes.radioSelected, "selected" + opt) : "")}
                onClick={handleOnSelect}
            >
                {opt}
            </button>
        );
    }

    return (
        <div className={classes.radioBtnWrapper}>
            {options.map(renderCtrlItem)}
        </div>
    );
}
