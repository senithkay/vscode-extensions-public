import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";

import React from "react";

export interface RecordButtonGroupProps {
  openRecordEditor: () => void;
  showTypeList: () => void;
}

export function RecordButtonGroup(props: RecordButtonGroupProps) {
  const { openRecordEditor, showTypeList } = props;

  return (
    <>
      <Button
        onClick={openRecordEditor}
        startIcon={<AddIcon />}
        color="primary"
        data-testid='new-record'
      >
        New Record
      </Button>
      OR
      <Button onClick={showTypeList} color="primary" data-testid='exiting-record'>
        Existing Record
      </Button>
    </>
  );
}
