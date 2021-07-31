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

import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers';

interface TimePickerCompProps {
           onTimeChange?: (timeValue: number[]) => void,
           defaultValue?: Date
}


export default function TimePickerComp(props: TimePickerCompProps) {
           const { onTimeChange, defaultValue } = props;
           const [selectedDate, handleDateChange] = useState(defaultValue ? defaultValue : new Date());

           const handleTimeChange = (time: Date) => {
                      const hour = time.getHours();
                      const minute = time.getMinutes();
                      handleDateChange(time);
                      onTimeChange([hour, minute]);
           }

           return (
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                 <TimePicker value={selectedDate} onChange={handleTimeChange} />
                      </MuiPickersUtilsProvider>
           );
}
