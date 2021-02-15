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
import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import TooltipBase, { TooltipProps } from '@material-ui/core/Tooltip';
import * as MonacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import useStyles, { tooltipInvertedStyles, tooltipStyles } from "./style";

import { InfoIcon } from "../../../../../../assets/icons";

export { TooltipProps } from '@material-ui/core/Tooltip';

interface TooltipPropsExtended extends TooltipProps {
    actionText?: string;
    actionLink?: string;
    inverted?: boolean;
    codeSnippet?: boolean;
    content?: string; // Only when Code Snippet prop available
    example?: boolean; // Only when Code Snippet prop available
    disabled?: boolean;
    heading?: string;
};

const TooltipComponent = withStyles(tooltipStyles)(TooltipBase);
const TooltipBaseInverted = withStyles(tooltipInvertedStyles)(TooltipBase);

export default function Tooltip(props: Partial<TooltipPropsExtended>) {
    const styles = useStyles();

    // Ref: <code>
    const codeRef = (ref: HTMLPreElement) => {
        if (ref) {
            MonacoEditor.editor.colorizeElement(ref, { theme: 'choreoLightTheme' });
        }
    };

    const { children, heading, title, content, example, actionText, actionLink, inverted, disabled, codeSnippet, ...restProps } = props;

    // Skip Tooltip rendering if disabled prop provided.
    if (disabled) return (<>{children}</>);

    let TooltipComponentRef = TooltipComponent;

    // Always invert background color if interactive prop set to `true`
    if (props.interactive) {
        TooltipComponentRef = TooltipBaseInverted;
    }

    let tooltipTitle = (
        <div>
            {heading && (<h4 className={styles.heading}>{heading}</h4>)}
            <div>{title}</div>
            {actionText && (<a className={styles.buttonLink} href={actionLink} target="_blank">{actionText}</a>)}
        </div>
    );

    // Modify tooltipTitle if codeSnippet prop has set.
    if (codeSnippet) {
        const Code = () => (
            <code
                ref={codeRef}
                data-lang="ballerina"
                className={example ? styles.codeExample : styles.code}
            >
                {content}
            </code>
        );

        let CodeSnippet = () => (
            <pre className={styles.pre}>
                <Code />
            </pre>
        );

        if (example) {
            CodeSnippet = () => (
                <div className={styles.exampleCodeWrap}>
                    <div>eg</div> <Code />
                </div>
            );
        }

        tooltipTitle = (
            <>
                {heading && (<h4 className={styles.heading}>{heading}</h4>)}
                {title && (<p>{title}</p>)}
                <CodeSnippet />
            </>
        );
    }

    return <TooltipComponentRef {...restProps} title={tooltipTitle}>{children}</TooltipComponentRef>
}

export function TooltipIcon(props: Partial<TooltipPropsExtended>) {
    const styles = useStyles();

    const infoIcon = <InfoIcon />;
    let iconComponent = infoIcon;

    const { title, children, ...restProps } = props;

    if (children) {
        iconComponent = <><div>{children}</div> <div className={styles.iconWrapper}>{infoIcon}</div></>;
    }

    return (
        <Tooltip {...restProps} title={title} interactive={true} placement="right-start">
            <div className={styles.componentWrapper}>
                {iconComponent}
            </div>
        </Tooltip>
    );
}

export function TooltipCodeSnippet(props: Partial<TooltipPropsExtended>) {
    const { content, children, ...restProps } = props;

    return (
        <Tooltip
            {...restProps}
            content={content.trim()}
            title={null}
            codeSnippet={true}
            interactive={true}
        >
            {children}
        </Tooltip>
    );
}
