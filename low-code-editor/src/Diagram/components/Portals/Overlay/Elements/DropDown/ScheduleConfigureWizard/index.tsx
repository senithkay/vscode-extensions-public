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
// tslint:disable: jsx-no-lambda
import React, { ReactNode, SyntheticEvent, useContext, useEffect, useState } from "react";

import { FunctionBodyBlock, FunctionDefinition } from "@ballerina/syntax-tree";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import FormHelperText from "@material-ui/core/FormHelperText";
import CloseIcon from "@material-ui/icons/Close";
import { isValidCron } from "cron-validator";
import { addMinutes, format } from "date-fns";

import { DiagramOverlay, DiagramOverlayPosition } from '../../..';
import { Context as DiagramContext } from "../../../../../../../Contexts/Diagram";
import { TRIGGER_TYPE_SCHEDULE } from "../../../../../../models";
import { PrimaryButton } from "../../../../ConfigForm/Elements/Button/PrimaryButton";
import { SelectDropdownWithButton } from "../../../../ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../../ConfigForm/Elements/TextField/FormTextInput";
import { TooltipIcon } from "../../../../ConfigForm/Elements/Tooltip";
import { tooltipMessages } from "../../../../utils/constants";
import { SourceUpdateConfirmDialog } from "../../SourceUpdateConfirmDialog";
import { useStyles } from "../styles";

import { repeatRange, weekOptions } from "./ScheduleConstants";
import { useStyles as toggleStyles } from "./style";
import TimePickerComp from "./TimePickerComp";
import WeekOptions from "./WeekOptions";

interface ScheduleConfigureWizardProps {
  position: DiagramOverlayPosition;
  onWizardComplete: () => void;
  onClose: () => void;
  cron?: string,
}

export interface ConnectorEvents {
  [key: string]: any;
}

export function ScheduleConfigureWizard(props: ScheduleConfigureWizardProps) {
  const { state } = useContext(DiagramContext);
  const {
    isMutationProgress: isFileSaving,
    isLoadingSuccess: isFileSaved,
    syntaxTree,
    onModify: dispatchModifyTrigger,
    trackTriggerSelection
  } = state;

  const model: FunctionDefinition = syntaxTree as FunctionDefinition;
  const body: FunctionBodyBlock = model?.functionBody as FunctionBodyBlock;
  const isEmptySource = (body?.statements.length < 1) || (body?.statements === undefined);

  const { position, onWizardComplete, onClose, cron } = props;
  const classes = useStyles();
  const toggleClasses = toggleStyles();

  const [currentCron, setCurrentCron] = useState<string>(cron || "");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [triggerChanged, setTriggerChanged] = useState(false);

  const cronSplit = currentCron?.split(" ", 5);

  const [cronMinuteValue, setCronMinuteValue] = useState(cron ? cronSplit[0] : format(new Date(), 'm'));
  const [cronHourValue, setCronHourValue] = useState(cron ? cronSplit[1] : format(new Date(), 'h'));
  const [cronDayValue, setCronDayValue] = useState(cron ? cronSplit[2] : format(new Date(), 'd'));
  const [cronMonthValue, setCronMonthValue] = useState(cron ? cronSplit[3] : format(new Date(), 'M'));
  const [cronWeekValue, setCronWeekValue] = useState(cron ? cronSplit[4] : weekOptions[0]);
  const [checked, setChecked] = useState(true);

  const modifyCronStartTime = new Date();
  modifyCronStartTime.setHours(Number(cronHourValue));
  modifyCronStartTime.setMinutes(Number(cronMinuteValue));

  const [scheduledComp, setScheduledComp] = useState("Minute");

  const [validCron, setValidCron] = useState(false);

  useEffect(() => {
    if (!isFileSaving && isFileSaved && triggerChanged) {
      onWizardComplete();
      setTriggerChanged(false);
    }
  }, [isFileSaving, isFileSaved]);

  const handleDialogOnCancel = () => {
    setShowConfirmDialog(false);
  };

  useEffect(() => {
    const genCron = cronMinuteValue + " " + cronHourValue + " " + cronDayValue + " " + cronMonthValue + " " + cronWeekValue;
    setCurrentCron(genCron);
    validateCron(genCron);

  }, [cronMinuteValue, cronHourValue, cronDayValue, cronMonthValue, cronWeekValue, cron]);

  function handleOnChangeCron(text: string) {
    setCurrentCron(text);
  }

  function validateCron(text: string) {
    if (isValidCron(text, { alias: true })) {
      setValidCron(true)
      return true;
    }
    setValidCron(false);
  }

  const handleUserConfirm = () => {
    if (isEmptySource) {
      handleOnSave();
    } else {
      // get user confirmation if code there
      setShowConfirmDialog(true);
    }
  };

  const handleDayChange = (dayValue: string) => {
    setCronDayValue(dayValue);
  }

  const handleWeekOptionChange = (weekValue: string[]) => {
    setCronWeekValue(weekValue.toString());
  }

  const handleTimeChange = (time: number[]) => {
    setCronHourValue(time[0].toString());
    setCronMinuteValue(time[1].toString());
  }

  const handleEveryDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cronDay = e.target.checked ? "*" : (new Date().getDate()).toString();
    setCronDayValue(cronDay);
  }

  const handleEveryWeekChange = (value: any) => {
    if (checked) {
      setCronWeekValue(value);
    }
    setCronWeekValue("Sun");
  }

  const handleEveryMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cronMonth = e.target.checked ? "*" : (new Date().getMonth() + 1).toString();
    setCronMonthValue(cronMonth);
  }

  const minuteGenCron = cronMinuteValue === "0" ? "0" : "*/" + cronMinuteValue;
  const hourGenCron = cronHourValue === "0" ? "0" : "*/" + cronHourValue;

  const cronForSelectedType = () => {
    if (scheduledComp === "Minute") {
      return minuteGenCron + " * * * *"
    } else if (scheduledComp === "Hourly") {
      return "0 " + hourGenCron + " * * *"
    } else if (scheduledComp === "Daily") {
      return cronMinuteValue + " " + cronHourValue + " " + cronDayValue + " * *"
    } else if (scheduledComp === "Monthly") {
      return cronMinuteValue + " " + cronHourValue + " " + cronDayValue + " " + cronMonthValue + " " + cronWeekValue
    } else {
      return currentCron;
    }
  }

  function isNumber(str: string) {
    if (typeof str !== "string") return false
    return !isNaN(parseFloat(str))
  }

  const UTCCronForSelectedType = () => {
    const updateCronStartTime = new Date();
    updateCronStartTime.setHours(Number(cronHourValue));
    updateCronStartTime.setMinutes(Number(cronMinuteValue));
    if (cronDayValue !== "*" && isNumber(cronDayValue)) {
      updateCronStartTime.setDate(Number(cronDayValue));
    }

    if (cronMonthValue !== "*" && isNumber(cronMonthValue)) {
      updateCronStartTime.setMonth(Number(cronMonthValue) - 1);
    }

    const timezoneOffsetMinutes = addMinutes(new Date(updateCronStartTime), (new Date()).getTimezoneOffset()).getMinutes();
    const timezoneOffsetHours = addMinutes(new Date(updateCronStartTime), (new Date()).getTimezoneOffset()).getHours();
    const timezoneOffsetDay = addMinutes(new Date(updateCronStartTime), (new Date()).getTimezoneOffset()).getDate();
    const timezoneOffsetMonth = addMinutes(new Date(updateCronStartTime), (new Date()).getTimezoneOffset()).getMonth() + 1;

    const cronDateUTCValue = (cronDayValue === "*") ? cronDayValue : timezoneOffsetDay;
    const cronMonthUTCValue = (cronMonthValue === "*") || !isNumber(cronMonthValue) ? cronMonthValue : timezoneOffsetMonth;

    if (scheduledComp === "Minute") {
      return minuteGenCron + " * * * *"
    } else if (scheduledComp === "Hourly") {
      return "0 " + hourGenCron + " * * *"
    } else if (scheduledComp === "Daily") {
      return timezoneOffsetMinutes + " " + timezoneOffsetHours + " " + cronDateUTCValue + " * *"
    } else if (scheduledComp === "Monthly") {
      return timezoneOffsetMinutes + " " + timezoneOffsetHours + " " + cronDateUTCValue + " " + cronMonthUTCValue + " " + cronWeekValue
    } else {
      return currentCron;
    }
  }

  const handleChange = (value: string) => {
    if (scheduledComp === "Minute") {
      setCronMinuteValue(value);
    } else if (scheduledComp === "Hourly") {
      setCronHourValue(value);
    } else if (scheduledComp === "Daily") {
      setCronDayValue(value);
    } else if (scheduledComp === "Weekly") {
      setCronWeekValue(value);
    } else if (scheduledComp === "Monthly") {
      setCronMonthValue(value);
    }
  }

  const handleOnSave = () => {
    setShowConfirmDialog(false);
    const utcCron = UTCCronForSelectedType();
    // dispatch and close the wizard
    setTriggerChanged(true);
    const saveSelectedCron = cronForSelectedType();
    dispatchModifyTrigger(TRIGGER_TYPE_SCHEDULE, undefined, {
      "CRON": saveSelectedCron,
      "UTCCRON": utcCron,
    });
    trackTriggerSelection("Schedule");
  };

  const deafultMinute = cron ? cronMinuteValue.replace("*/", "") : cronMinuteValue;
  const deafultHour = cron ? cronHourValue.replace("*/", "") : cronHourValue;
  const deafultDay = cron ? cronDayValue.replace("*/", "") : cronDayValue;

  const minuteAndHourOptionComp: ReactNode = (
    <div className={toggleClasses.flexWrapper}>
      <FormHelperText className={toggleClasses.titleLabel}>Start Time: </FormHelperText>
      <div className={toggleClasses.flexWrapper}>
        <TimePickerComp onTimeChange={handleTimeChange} defaultValue={modifyCronStartTime} />
      </div>
    </div>
  );

  const minuteOptionComp: ReactNode = (
    <div className={toggleClasses.flexWrapper}>
      <FormHelperText className={toggleClasses.titleLabel}>Every: </FormHelperText>
      <div className={toggleClasses.timeOptionsWrapper}>
        <FormTextInput
          defaultValue={deafultMinute}
          onChange={handleChange}
        />
      </div>
      <FormHelperText className={toggleClasses.titleLabel}>Minute(s)</FormHelperText>
    </div>
  );

  const hourOptionComp: ReactNode = (
    <div className={toggleClasses.flexWrapper}>
      <FormHelperText className={toggleClasses.titleLabel}>Every: </FormHelperText>
      <div className={toggleClasses.timeOptionsWrapper}>
        <FormTextInput
          defaultValue={deafultHour}
          onChange={handleChange}
        />
      </div>
      <FormHelperText className={toggleClasses.titleLabel}>Hour(s)</FormHelperText>
    </div>
  );

  const dayOptionComp: ReactNode = (
    <div className={toggleClasses.flexWrapper}>
      <FormHelperText className={toggleClasses.titleLabel}>Start date on:</FormHelperText>
      <div className={toggleClasses.timeOptionsWrapper}>
        <FormTextInput
          defaultValue={deafultDay}
          onChange={handleDayChange}
        />
      </div>
    </div>
  );

  const weekOptionComp: ReactNode = (
    <div>
      <WeekOptions
        onWeekOptionChange={handleWeekOptionChange}
        textLabel="Repeat on the:"
        defaultValue={cronWeekValue.replace("\n", "").split(",")}
      />
    </div>
  );

  const repeatEveryDaily: ReactNode = (
    <div className={toggleClasses.flexWrapper}>
      <FormControlLabel
        control={(
          <Checkbox
            classes={{
              root: toggleClasses.checkbox,
              checked: toggleClasses.checked
            }}
            onChange={handleEveryDayChange}
          />
        )}
        label={"Repeat every daily"}
      />
    </div>
  );

  const repeatEveryWeek: ReactNode = (
    <div className={toggleClasses.flexWrapper}>
      <FormControlLabel
        control={(
          <Checkbox
            classes={{
              root: toggleClasses.checkbox,
              checked: toggleClasses.checked
            }}
            onChange={handleEveryWeekChange}
          />
        )}
        label={"Repeat every week"}
      />
    </div>
  );

  const repeatEveryMonth: ReactNode = (
    <div className={toggleClasses.flexWrapper}>
      <FormControlLabel
        control={(
          <Checkbox
            classes={{
              root: toggleClasses.checkbox,
              checked: toggleClasses.checked
            }}
            onChange={handleEveryMonthChange}
          />
        )}
        label={"Repeat every month"}
      />
    </div>
  );

  const customCron: ReactNode = (
    <div className={toggleClasses.cronGenWrapper}>
      <p className={toggleClasses.cronExpressionTitle}>Generated Cron Expression :</p>
      <FormTextInput
        placeholder="* * * * *"
        defaultValue={currentCron}
        onChange={handleOnChangeCron}
        customProps={{
          validate: validateCron
        }}
        errorMessage="Please enter valid cron expression"
      />
    </div>
  );

  const handleSchedule = (selectedRepeatRange: string) => {
    setScheduledComp(selectedRepeatRange);
    if (selectedRepeatRange === "") {
      setScheduledComp("Minute");
    }
  }

  const dayComp: ReactNode = (
    <>
      {minuteAndHourOptionComp}
      {repeatEveryDaily}

    </>
  );

  const weekComp: ReactNode = (
    <>
      {minuteAndHourOptionComp}
      {repeatEveryWeek}
      {weekOptionComp}
    </>
  );

  const monthComp: ReactNode = (
    <>
      {minuteAndHourOptionComp}
      {dayOptionComp}
      {repeatEveryMonth}
      {weekOptionComp}
    </>
  );

  return (
    <DiagramOverlay
      className={classes.container}
      position={position}
    >
      <>
        <div className={classes.titleWrapper}>
          <p className={classes.title}>Configure Schedule Trigger</p>
          <TooltipIcon
            title={tooltipMessages.cronExpression.title}
            actionText={tooltipMessages.cronExpression.actionText}
            actionLink={tooltipMessages.cronExpression.actionLink}
            placement="left"
            arrow={true}
            interactive={true}
          />
        </div>

        <button className={classes.closeBtnWrapper} onClick={onClose}>
          <CloseIcon className={classes.closeBtn} />
        </button>

        <div className={classes.customWrapper}>
          <div className={toggleClasses.repreatMainWarpper}>
            <SelectDropdownWithButton
              customProps={{
                disableCreateNew: true,
                values: repeatRange,
                optional: false,
                className: toggleClasses.repeatRangeDropdown
              }}
              label="Repeat every :"
              defaultValue={scheduledComp}
              onChange={handleSchedule}
            />
          </div>

          {scheduledComp === "Minute" && minuteOptionComp}
          {scheduledComp === "Hourly" && hourOptionComp}
          {scheduledComp === "Daily" && dayComp}
          {scheduledComp === "Weekly" && weekComp}
          {scheduledComp === "Monthly" && monthComp}
          {scheduledComp === "Custom" && customCron}

          {!validCron ? <p className={toggleClasses.invalidCron}> Invalid value</p> : null}

        </div>
        <div className={classes.customFooterWrapper}>
          <PrimaryButton
            text="Save"
            className={classes.saveBtn}
            onClick={handleUserConfirm}
            disabled={!validCron}
          />
        </div>
        {
          showConfirmDialog && (
            <SourceUpdateConfirmDialog
              onConfirm={handleOnSave}
              onCancel={handleDialogOnCancel}
            />
          )
        }
      </>
    </DiagramOverlay>
  );
}
