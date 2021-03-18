import React from "react";

import CloseIcon from "@material-ui/icons/Close";

import { useStyles } from "./styles";

export { default as Section } from "./Section";

export default function ConfigPanel(props: any) {
    const classes = useStyles();
    const { title, children, onClose } = props;

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <p className={classes.title}>{title}</p>
                <button className={classes.closeBtnWrapper} onClick={onClose}>
                    <CloseIcon className={classes.closeBtn} />
                </button>
            </div>
            {children}
        </div>
    );
}
