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
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { FunctionBodyBlock, FunctionDefinition, STKindChecker } from "@ballerina/syntax-tree";
import { Checkbox, FormControlLabel } from "@material-ui/core";
import FormHelperText from "@material-ui/core/FormHelperText";
import CloseIcon from "@material-ui/icons/Close";
import { isValidCron } from "cron-validator";
import { addMinutes, format } from "date-fns";

import { DiagramOverlay, DiagramOverlayPosition } from '../../..';
import { TooltipIcon } from "../../../../../../../components/Tooltip";
import { Context as DiagramContext } from "../../../../../../../Contexts/Diagram";
import { TRIGGER_TYPE_SCHEDULE } from "../../../../../../models";
import { PrimaryButton } from "../../../../ConfigForm/Elements/Button/PrimaryButton";
import { SelectDropdownWithButton } from "../../../../ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../../ConfigForm/Elements/TextField/FormTextInput";
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
    trackTriggerSelection,
    onMutate,
    originalSyntaxTree
  } = state;

  const model: FunctionDefinition = syntaxTree as FunctionDefinition;
  const body: FunctionBodyBlock = model?.functionBody as FunctionBodyBlock;
  const isEmptySource = (body?.statements.length < 1) || (body?.statements === undefined);

  const { position, onWizardComplete, onClose, cron } = props;
  const classes = useStyles();
  const intl = useIntl();
  const toggleClasses = toggleStyles();

  const [currentCron, setCurrentCron] = useState<string>(cron || "");
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

  const handleDayChange = (dayValue: string) => {
    setCronDayValue(dayValue);
  }

  const orderedDays: string[] = [];
  const handleWeekOptionChange = (weekValue: string[]) => {
    if (weekValue.length <= 1) {
      setCronWeekValue(weekValue.toString());
    } else {
      orderedDays.push(weekValue.find(value => value === "Sun"));
      orderedDays.push(weekValue.find(value => value === "Mon"));
      orderedDays.push(weekValue.find(value => value === "Tue"));
      orderedDays.push(weekValue.find(value => value === "Wed"));
      orderedDays.push(weekValue.find(value => value === "Thu"));
      orderedDays.push(weekValue.find(value => value === "Fri"));
      orderedDays.push(weekValue.find(value => value === "Sat"));
      setCronWeekValue(orderedDays.filter(day => day !== undefined).toString());
    }
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

  const minuteGenCron = cronMinuteValue === "0" ? "0" : (cronMinuteValue.substring(0, 2) === "*/" ? cronMinuteValue :  "*/" + cronMinuteValue);
  const hourGenCron = cronHourValue === "0" ? "0" : (cronHourValue.substring(0, 2) === "*/" ? cronHourValue : "*/" + cronHourValue);

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
    const utcCron = UTCCronForSelectedType();
    // dispatch and close the wizard
    setTriggerChanged(true);
    const saveSelectedCron = cronForSelectedType();
    dispatchModifyTrigger(TRIGGER_TYPE_SCHEDULE, undefined, {
      "CRON": saveSelectedCron,
      "UTCCRON": utcCron,
      "IS_EXISTING_CONFIG": !STKindChecker.isModulePart(syntaxTree),
      "SYNTAX_TREE": originalSyntaxTree
    });
    trackTriggerSelection("Schedule");
  };

  const deafultMinute = cron ? cronMinuteValue.replace("*/", "") : cronMinuteValue;
  const deafultHour = cron ? cronHourValue.replace("*/", "") : cronHourValue;
  const deafultDay = cron ? cronDayValue.replace("*/", "") : cronDayValue;

  const minuteAndHourOptionComp: ReactNode = (
    <div className={toggleClasses.flexWrapper}>
      <FormHelperText className={toggleClasses.titleLabel}><FormattedMessage id="lowcode.develop.scheduleConfigWizard.startTime.title" defaultMessage="Start Time:"/></FormHelperText>
      <div className={toggleClasses.timeWrapper}>
        <TimePickerComp onTimeChange={handleTimeChange} defaultValue={modifyCronStartTime} />
      </div>
    </div>
  );

  const minuteOptionComp: ReactNode = (
    <div className={toggleClasses.flexWrapper}>
      <FormHelperText className={toggleClasses.titleLabel}><FormattedMessage id="lowcode.develop.scheduleConfigWizard.everyMinute.title" defaultMessage="Every:"/></FormHelperText>
      <div className={toggleClasses.timeOptionsWrapper}>
        <FormTextInput
          defaultValue={deafultMinute}
          onChange={handleChange}
        />
      </div>
      <FormHelperText className={toggleClasses.titleLabel}><FormattedMessage id="lowcode.develop.scheduleConfigWizard.minutes.title" defaultMessage="Minute(s):"/></FormHelperText>
    </div>
  );

  const hourOptionComp: ReactNode = (
    <div className={toggleClasses.flexWrapper}>
      <FormHelperText className={toggleClasses.titleLabel}><FormattedMessage id="lowcode.develop.scheduleConfigWizard.everyHour.title" defaultMessage="Every:"/></FormHelperText>
      <div className={toggleClasses.timeOptionsWrapper}>
        <FormTextInput
          defaultValue={deafultHour}
          onChange={handleChange}
        />
      </div>
      <FormHelperText className={toggleClasses.titleLabel}><FormattedMessage id="lowcode.develop.scheduleConfigWizard.hours.title" defaultMessage="Hour(s)"/></FormHelperText>
    </div>
  );

  const dayOptionComp: ReactNode = (
    <div className={toggleClasses.flexWrapper}>
      <FormHelperText className={toggleClasses.titleLabel}><FormattedMessage id="lowcode.develop.scheduleConfigWizard.startDate.title" defaultMessage="Start Date:"/></FormHelperText>
      <div className={toggleClasses.timeOptionsWrapper}>
        <FormTextInput
          defaultValue={deafultDay}
          onChange={handleDayChange}
        />
      </div>
    </div>
  );
  const repeatLabel = intl.formatMessage({
  id: "lowcode.develop.scheduleConfigWizard.repeatLabel.text",
  defaultMessage: "Repeat on the:"
});

  const repeatWeeklyLabel = intl.formatMessage({
  id: "lowcode.develop.scheduleConfigWizard.repeatWeeklyLabel.text",
  defaultMessage: "Repeat weekly"
});

  const repeatMonthlyLabel = intl.formatMessage({
  id: "lowcode.develop.scheduleConfigWizard.repeatMonthlyLabel.text",
  defaultMessage: "Repeat monthly"
});

  const cronExpressionTitle = intl.formatMessage({
  id: "lowcode.develop.scheduleConfigWizard.cronExpression.title",
  defaultMessage: "Cron Expression :"
});

  const cronExpressionErrorMessage = intl.formatMessage({
  id: "lowcode.develop.scheduleConfigWizard.cronExpressionErrorMessage.title",
  defaultMessage: "Please enter a valid cron expression"
});

  const scheduleTriggerConfigTitle = intl.formatMessage({
  id: "lowcode.develop.scheduleConfigWizar.Config.Title",
  defaultMessage: "Configure Schedule Trigger"
});

  const repeatScheduleDropDown = intl.formatMessage({
  id: "lowcode.develop.scheduleConfigWizar.repeatEveryDropDown.label",
  defaultMessage: "Schedule:"
});

  const invalidValueErrorMessage = intl.formatMessage({
  id: "lowcode.develop.scheduleConfigWizar.invalidValueErrorMessage.text",
  defaultMessage: "Invalid value"
});

  const saveScheduleButton = intl.formatMessage({
  id: "lowcode.develop.scheduleConfigWizar.saveButton.text",
  defaultMessage: "Save"
});

  const scheduleTriggerTooltipMessages = {
  scheduleConfig: {
  title: intl.formatMessage({
      id: "lowcode.develop.triggerDropDown.scheduleTriggerTooltips.tooltip.title",
      defaultMessage: "Set a schedule to run the integration."
  })
},
  cronExpression: {
  title: intl.formatMessage({
    id: "lowcode.develop.triggerDropDown.scheduleTriggerTooltips.cronExpression.tooltip.title",
    defaultMessage: "A cron expression is a string that contains subfields separated by white spaces. Each special character represents Seconds, Minutes, Hours, Date, Month, and Day respectively."
}),
  actionText: intl.formatMessage({
  id: "lowcode.develop.triggerDropDown.scheduleTriggerTooltips.cronExpression.tooltip.actionText",
  defaultMessage: "Read more"
}),
  actionLink: intl.formatMessage({
  id: "lowcode.develop.triggerDropDown.scheduleTriggerTooltips.cronExpression.tooltip.actionLink",
  defaultMessage: "https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/"
})
}
}
  const weekOptionComp: ReactNode = (
    <div>
      <WeekOptions
        onWeekOptionChange={handleWeekOptionChange}
        textLabel={repeatLabel}
        defaultValue={cronWeekValue.replace("\n", "").split(",")}
      />
    </div>
  );

  // const repeatEveryDaily: ReactNode = (
  //   <div className={toggleClasses.flexWrapper}>
  //     <FormControlLabel
  //       control={(
  //         <Checkbox
  //           classes={{
  //             root: toggleClasses.checkbox,
  //             checked: toggleClasses.checked
  //           }}
  //           onChange={handleEveryDayChange}
  //         />
  //       )}
  //       label={"Repeat Daily "}
  //     />
  //   </div>
  // );

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
        label={repeatWeeklyLabel}
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
        label={repeatMonthlyLabel}
      />
    </div>
  );

  const customCron: ReactNode = (

    <div className={toggleClasses.cronGenWrapper}>

      <div>
        <TooltipIcon
          title={scheduleTriggerTooltipMessages.cronExpression.title}
          actionText={scheduleTriggerTooltipMessages.cronExpression.actionText}
          actionLink={scheduleTriggerTooltipMessages.cronExpression.actionLink}
          placement="left"
          arrow={true}
          interactive={true}
        >
          <p className={toggleClasses.cronExpressionTitle}>{cronExpressionTitle}</p>
        </TooltipIcon>
      </div>


      <FormTextInput
        placeholder="* * * * *"
        defaultValue={currentCron}
        onChange={handleOnChangeCron}
        customProps={{
          validate: validateCron
        }}
        errorMessage={cronExpressionErrorMessage}
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
      {/* {repeatEveryDaily} */}

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
          <p className={classes.title}>{scheduleTriggerConfigTitle}</p>
          <div>
            <TooltipIcon
              title={scheduleTriggerTooltipMessages.scheduleConfig.title}
              placement="left"
              arrow={true}
              interactive={true}
            />
          </div>
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
              label={repeatScheduleDropDown}
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

          {!validCron ? <p className={toggleClasses.invalidCron}> {invalidValueErrorMessage}</p> : null}

        </div>
        <div className={classes.customFooterWrapper}>
          <PrimaryButton
            text={saveScheduleButton}
            className={classes.saveBtn}
            onClick={handleOnSave}
            disabled={!validCron}
          />
        </div>
      </>
    </DiagramOverlay>
  );
}
