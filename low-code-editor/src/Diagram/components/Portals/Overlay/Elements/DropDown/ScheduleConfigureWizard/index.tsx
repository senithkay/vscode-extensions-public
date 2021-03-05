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
import { TextField } from "@material-ui/core";
import FormHelperText from "@material-ui/core/FormHelperText";
import CloseIcon from "@material-ui/icons/Close";
import Autocomplete from "@material-ui/lab/Autocomplete";
import classNames from "classnames";
import { isValidCron } from "cron-validator";
import { format } from "date-fns";

import { DiagramOverlay, DiagramOverlayPosition } from '../../..';
import { Context as DiagramContext } from "../../../../../../../Contexts/Diagram";
import { TRIGGER_TYPE_SCHEDULE } from "../../../../../../models";
import { DefaultConfig } from "../../../../../../visitors/default";
import { PrimaryButton } from "../../../../ConfigForm/Elements/Button/PrimaryButton";
import { SelectDropdownWithButton } from "../../../../ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../../../ConfigForm/Elements/TextField/FormTextInput";
import { TooltipIcon } from "../../../../ConfigForm/Elements/Tooltip";
import { tooltipMessages } from "../../../../utils/constants";
import { SourceUpdateConfirmDialog } from "../../SourceUpdateConfirmDialog";
import { useStyles } from "../styles";

import { dayOptions, hourOptions, minuteOptions, monthOptions, repeatRange, weekOptions } from "./ScheduleConstants";
import { useStyles as toggleStyles } from "./style";
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
  const [cronMonthValue, setCronMonthValue] = useState(cron ? cronSplit[3] : format(new Date(), 'MMM'));
  const [cronWeekValue, setCronWeekValue] = useState(cron ? cronSplit[4] : weekOptions[0]);
  const [scheduledComp, setScheduledComp] = useState("minute");

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

  const cronForSelectedType = () => {
    if (scheduledComp === "minute") {
      return cronMinuteValue + " * * * *"
    } else if (scheduledComp === "hour") {
      return cronMinuteValue + " " + cronHourValue + " * * *"
    } else if (scheduledComp === "day") {
      return cronMinuteValue + " " + cronHourValue + " " + cronDayValue + " * *"
    } else if (scheduledComp === "month") {
      return cronMinuteValue + " " + cronHourValue + " " + cronDayValue + " " + cronMonthValue + " " + cronWeekValue
    } else {
      return currentCron;
    }
  }

  const handleOnSave = () => {
    setShowConfirmDialog(false);
    // dispatch and close the wizard
    setTriggerChanged(true);
    const saveSelectedCron = cronForSelectedType();
    dispatchModifyTrigger(TRIGGER_TYPE_SCHEDULE, undefined, {
      "CRON": saveSelectedCron,
    });
    trackTriggerSelection("Schedule");
  };

  const handleWeekOptionChange = (weekValue: string[]) => {
    setCronWeekValue(weekValue.toString());
  }

  const handleChange = (value: string, type: string) => {
    if (type === 'minutes') {
      setCronMinuteValue(value);

    } else if (type === 'hours') {
      setCronHourValue(value);

    } else if (type === 'days') {
      setCronDayValue(value);

    } else if (type === 'months') {
      setCronMonthValue(value);
    }
  }
  const preventDiagramScrolling = (e: SyntheticEvent) => {
    e.stopPropagation();
  }

  const minuteOptionComp: ReactNode = (
    <div className={toggleClasses.flexWrapper}>
      <FormHelperText className={toggleClasses.titleLabel}>Select minute :</FormHelperText>
      <div onWheel={preventDiagramScrolling}>
        <Autocomplete
          className={toggleClasses.repeatDropdown}
          options={minuteOptions}
          freeSolo={false}
          onWheel={preventDiagramScrolling}
          clearOnBlur={false}
          closeIcon={true}
          openOnFocus={true}
          inputValue={cronMinuteValue}
          onChange={(e: React.ChangeEvent<{}>, value: string) => {
            handleChange(value, "minutes")
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              className={toggleClasses.outlineTextField}
              defaultValue={cronMinuteValue}
              onChange={(e) => {
                handleChange(e.target.value, "minutes")
              }}
            />
          )}
        />
      </div>
    </div>
  );

  const timeOptionComp: ReactNode = (
    <div className={toggleClasses.timeAndRangeWrapper}>
      <FormHelperText className={toggleClasses.titleLabel}>Start time :</FormHelperText>
      <div className={toggleClasses.flexWrapper}>

        <div onWheel={preventDiagramScrolling}>
          <Autocomplete
            className={toggleClasses.repeatDropdown}
            options={hourOptions}
            freeSolo={false}
            onWheel={preventDiagramScrolling}
            clearOnBlur={false}
            closeIcon={true}
            openOnFocus={false}
            inputValue={cronHourValue}
            onChange={(_e: React.ChangeEvent<{}>, value: string) => {
              handleChange(value, "hours")
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                className={toggleClasses.outlineTextField}
                defaultValue={cronHourValue}
                onChange={(e) => {
                  handleChange(e.target.value, "hours")
                }}
              />
            )}
          />
        </div>

        <span className={toggleClasses.spanWrapper}> : </span>
        <div onWheel={preventDiagramScrolling}>
          <Autocomplete
            className={toggleClasses.repeatDropdown}
            options={minuteOptions}
            freeSolo={false}
            onWheel={preventDiagramScrolling}
            clearOnBlur={false}
            closeIcon={true}
            openOnFocus={true}
            inputValue={cronMinuteValue}
            onChange={(e: React.ChangeEvent<{}>, value: string) => {
              handleChange(value, "minutes")
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                className={toggleClasses.outlineTextField}
                defaultValue={cronMinuteValue}
                onChange={(e) => {
                  handleChange(e.target.value, "minutes")
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
  );

  const dayOptionComp: ReactNode = (
    <div className={toggleClasses.timeAndRangeWrapper}>
      <FormHelperText className={classNames(toggleClasses.titleLabel, toggleClasses.titleSpacing)}>Select day :</FormHelperText>
      <div onWheel={preventDiagramScrolling}>
        <Autocomplete
          className={toggleClasses.repeatDropdown}
          options={dayOptions}
          onWheel={preventDiagramScrolling}
          freeSolo={false}
          clearOnBlur={false}
          closeIcon={false}
          openOnFocus={true}
          inputValue={cronDayValue}
          onChange={(e: React.ChangeEvent<{}>, value: string) => {
            handleChange(value, "days")
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              className={classNames(toggleClasses.outlineTextField, toggleClasses.dateTextField)}
              defaultValue={cron ? cronDayValue : ""}
              onChange={(e) => {
                handleChange(e.target.value, "days")
              }}
            />
          )}
        />
      </div>
    </div>
  );

  const weekOptionComp: ReactNode = (
    <div>
      <WeekOptions
        onWeekOptionChange={handleWeekOptionChange}
        textLabel="Repeat on :"
        defaultValue={cronWeekValue.replace("\n", "").split(",")}
      />
    </div>
  );

  const monthOptionComp: ReactNode = (
    <div className={toggleClasses.timeAndRangeWrapper}>
      <FormHelperText className={classNames(toggleClasses.titleLabel, toggleClasses.titleSpacing)}>Select month :</FormHelperText>
      <div onWheel={preventDiagramScrolling}>
        <Autocomplete
          className={toggleClasses.repeatDropdown}
          options={monthOptions}
          onWheel={preventDiagramScrolling}
          freeSolo={false}
          clearOnBlur={false}
          closeIcon={false}
          openOnFocus={false}
          inputValue={cronMonthValue}
          onChange={(e: React.ChangeEvent<{}>, value: string) => {
            handleChange(value, "months")
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              className={classNames(toggleClasses.outlineTextField, toggleClasses.dateTextField)}
              defaultValue={cronMonthValue}
              onChange={(e) => {
                handleChange(e.target.value, "months")
              }}
            />
          )}
        />
      </div>
    </div>
  );

  const customCron: ReactNode = (
    <div className={toggleClasses.cronGenWrapper}>
      <p className={toggleClasses.titleLabel}>Generated Cron Expression :</p>
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
      setScheduledComp("minute");
    }
  }

  const dayComp: ReactNode = (
    <>
      {timeOptionComp}
      {dayOptionComp}
    </>
  );

  const weekComp: ReactNode = (
    <>
      <div className={toggleClasses.flexWrapper}>
        {timeOptionComp}
      </div>
      <div className={toggleClasses.flexWrapper}>
        {dayOptionComp}
      </div>
      {weekOptionComp}
    </>
  );

  const monthComp: ReactNode = (
    <>
      <div className={toggleClasses.flexWrapper}>
        {timeOptionComp}
      </div>
      <div className={toggleClasses.flexWrapper}>
        {dayOptionComp} {monthOptionComp}
      </div>
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
          <p className={classes.title}>Schedule Configuration :</p>
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
              label="Schedule type :"
              defaultValue={scheduledComp}
              onChange={handleSchedule}
            />
          </div>

          {scheduledComp === "minute" && minuteOptionComp}
          {scheduledComp === "hour" && timeOptionComp}
          {scheduledComp === "day" && dayComp}
          {scheduledComp === "week" && weekComp}
          {scheduledComp === "month" && monthComp}
          {scheduledComp === "custom" && customCron}

          {!validCron ? <p className={toggleClasses.invalidCron}> Invalid value</p> : null}

        </div>
        <div className={classes.customFooterWrapper}>
          <PrimaryButton
            text="Save Schedule"
            className={classes.saveBtn}
            onClick={handleUserConfirm}
            disabled={!validCron}
          />
        </div>
        {
          showConfirmDialog && (
            <SourceUpdateConfirmDialog
              position={{
                x: position.x + DefaultConfig.configureWizardOffset.x,
                y: position.y + DefaultConfig.configureWizardOffset.y + 190
              }}
              onConfirm={handleOnSave}
              onCancel={handleDialogOnCancel}
            />
          )
        }
      </>
    </DiagramOverlay>
  );
}
