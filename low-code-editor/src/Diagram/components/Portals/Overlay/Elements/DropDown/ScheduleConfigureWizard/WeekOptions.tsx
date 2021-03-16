/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useState } from 'react';

import { FormHelperText } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import classNames from 'classnames';

import { weekOptions } from './ScheduleConstants';
import { useStyles } from "./style";

interface WeekOptionsProps {
    textLabel?: string;
    onWeekOptionChange: (weekDay: string[]) => void,
    defaultValue?: string[];
}

export default function WeekOptions(props: WeekOptionsProps) {
    const { textLabel, onWeekOptionChange, defaultValue } = props;
    const classes = useStyles();
    const [selectedDay, setSelectedDay] = useState(defaultValue);

    const handleSelectedDay = (event: any, selectedDayOption: string[]) => {
        const filterStar = selectedDayOption.length > 0 ? selectedDayOption.filter(asteric => asteric !== "*") : ["*"];
        setSelectedDay(selectedDayOption);
        onWeekOptionChange(filterStar);
    };

    React.useEffect(() => {
        setSelectedDay(defaultValue);
    }, [defaultValue]);

    return (
        <div className={classes.groupToggleWrapper}>
            <FormHelperText className={classes.titleLabel}>{textLabel}</FormHelperText>

            <ToggleButtonGroup value={selectedDay} onChange={handleSelectedDay} aria-label="Day selection">
                <ToggleButton className={classNames(classes.toggleButtonWrapper, "toggle-button-wrapper")} value={weekOptions[1]} aria-label="Sunday">
                    Su
            </ToggleButton>
                <ToggleButton className={classNames(classes.toggleButtonWrapper, "toggle-button-wrapper")}  value={weekOptions[2]}  aria-label="Monday">
                    Mo
            </ToggleButton>
                <ToggleButton className={classNames(classes.toggleButtonWrapper, "toggle-button-wrapper")}  value={weekOptions[3]}  aria-label="Tuesday">
                    Tu
            </ToggleButton>
                <ToggleButton className={classNames(classes.toggleButtonWrapper, "toggle-button-wrapper")}  value={weekOptions[4]}  aria-label="Wednesday">
                    We
            </ToggleButton>
                <ToggleButton className={classNames(classes.toggleButtonWrapper, "toggle-button-wrapper")}  value={weekOptions[5]} aria-label="Thursday">
                    Th
            </ToggleButton>
                <ToggleButton className={classNames(classes.toggleButtonWrapper, "toggle-button-wrapper")}  value={weekOptions[6]}  aria-label="Friday">
                    Fr
            </ToggleButton>
                <ToggleButton className={classNames(classes.toggleButtonWrapper, "toggle-button-wrapper")}  value={weekOptions[7]}  aria-label="Saturday">
                    Sa
            </ToggleButton>
            </ToggleButtonGroup>
        </div>
    );
}

