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
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { Box, FormControl, Typography } from "@material-ui/core";
import { CloseRounded } from "@material-ui/icons";
import { ButtonWithIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { AddIcon } from "../../../../../../assets/icons";
import DeleteButton from "../../../../../../assets/icons/DeleteButton";
import { useDiagramContext } from "../../../../../../Contexts/Diagram";
import { createImportStatement, createTrigger } from "../../../../../utils/modification-util";
import { SelectDropdownWithButton } from "../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { FormActionButtons } from "../../../FormFieldComponents/FormActionButtons";
import { FormGeneratorProps } from "../../../FormGenerator";
import { wizardStyles as useFormStyles } from "../../style";
import "../style.scss";

import slackTrigger from "./slackTrigger.json";

export interface TriggerParameters {
    id: number;
    name: string;
    type?: string;
}

export function TriggerForm(props: FormGeneratorProps) {
    const { onCancel, onSave, targetPosition } = props
    const formClasses = useFormStyles();
    const intl = useIntl();
    const [selectedChannels, setSelectedChannels] = useState([]);
    const [allServiceTypes, setAllServiceTypes] = useState(slackTrigger.serviceTypes.map((type: any) => type.name));
    const [addNewChannel, setNewChannel] = useState(false);
    const { api: { code: { modifyDiagram } } } = useDiagramContext();
    const notSelectedChannels = allServiceTypes.filter(elements => !selectedChannels.includes(elements));
    const addnewChannelView = () => setNewChannel(true);

    const handleOnChannelSelect = (channel: string) => {
        const abc: string[] = [...selectedChannels, channel];
        setSelectedChannels(abc);
        setNewChannel(false);
    }

    const dropDownWithButton = (
        <SelectDropdownWithButton
            defaultValue={""}
            onChange={handleOnChannelSelect}
            customProps={{ disableCreateNew: true, values: notSelectedChannels }}
            placeholder=""
            label="Select Channel"
        />
    );

    // const preLoader = (
    //     <div className={wizardClasses.loaderWrapper}>
    //         <TextPreloaderVertical position="relative" />
    //     </div>
    // )

    const addNewChannelButton = (
        <span onClick={addnewChannelView} className={formClasses.addPropertyBtn}    >
            <AddIcon />
            <p><FormattedMessage id="lowcode.develop.triggerConfigForm.trigger.addChannel.title" defaultMessage="Add Channel" /></p>
        </span>
    );

    const createTriggerCode = () => {
        modifyDiagram([
            createImportStatement(
                "ballerina",
                "http",
                targetPosition
            ),
            createImportStatement(
                "ballerinax",
                slackTrigger.moduleName,
                targetPosition
            ),
            createTrigger(slackTrigger, targetPosition)
        ]);
        onSave();
    }

    const onDeleteChannel = (channelName: string) => {
        setSelectedChannels(selectedChannels.filter((currentChannel) => currentChannel !== channelName));
    }

    const SelectedTriggerItem = (prop: any) => {
        return (
            <div className={formClasses.headerWrapper}>
                <div className={formClasses.headerLabel}>
                    {prop.channelName}
                    <DeleteButton
                        onClick={onDeleteChannel.bind(this, prop.channelName)}
                    />
                </div>
            </div>
        )
    }

    return (
        <>
            <FormControl data-testid="log-form" className={formClasses.wizardFormControl}>
                <div className={formClasses.formWrapper}>
                    <div className={formClasses.formFeilds}>
                        <div className={formClasses.formWrapper}>
                            <div className={formClasses.formTitleWrapper}>
                                <div className={formClasses.mainTitleWrapper}>
                                    <Typography variant="h4">
                                        <Box paddingTop={2} paddingBottom={2}>
                                            <FormattedMessage id="lowcode.develop.triggerConfigForm.trigger.title" defaultMessage="Slack Trigger" />
                                        </Box>
                                    </Typography>
                                </div>
                            </div>
                            {/* {(isLoading || isConnectorLoading) && (preLoader)} */}
                            <div>
                                <Typography>
                                    Service Config
                                </Typography>
                            </div>
                            <div>
                                {selectedChannels.map((channel, index) => (<SelectedTriggerItem key={index} channelName={channel} />))}
                                {addNewChannel || selectedChannels.length === 0 ? dropDownWithButton : (notSelectedChannels.length !== 0 ? addNewChannelButton : (null))}
                            </div>
                            <div>
                                <FormActionButtons
                                    cancelBtnText="Cancel"
                                    saveBtnText={"Create"}
                                    isMutationInProgress={selectedChannels.length === 0}
                                    validForm={true}
                                    onSave={createTriggerCode}
                                    onCancel={onCancel}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </FormControl>
        </>
    );
}
