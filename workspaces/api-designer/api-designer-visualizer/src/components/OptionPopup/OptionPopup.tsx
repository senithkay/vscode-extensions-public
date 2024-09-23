import { Button, Dialog, CheckBoxGroup, CheckBox } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import React from 'react';

const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: flex-end;
    flex-grow: 1;
`;

interface OptionPopupProps {
    options: string[];
    selectedOptions: string[];
    onOptionChange: (options: string[]) => void;
    onDeleteResource?: () => void;
}

export function OptionPopup(props: OptionPopupProps) {
    const { options, selectedOptions, onOptionChange } = props;
    const [isOpen, setIsOpen] = React.useState(false);

    const handleOnClose = () => {
        setIsOpen(false);
    };

    const openDialog = () => {
        setIsOpen(true);
    };

    const handleOnDelete = () => {
        if (props.onDeleteResource) {
            props.onDeleteResource();
        }
    }

    return (
        <>
            <ButtonWrapper> 
                <Button appearance="primary" onClick={openDialog}> Add More Options </Button>
                <Button buttonSx={{background: "red"}} appearance="primary" onClick={handleOnDelete}> Delete Resource </Button>
            </ButtonWrapper>
            <Dialog sx={{width: "fit-content", minWidth: 120}} isOpen={isOpen} onClose={handleOnClose}>
                <CheckBoxGroup>
                    {options.map((option) => (
                        <CheckBox
                            key={option}
                            label={option}
                            value={option}
                            checked={selectedOptions?.includes(option)}
                            onChange={(checked: boolean) => {
                                if (checked) {
                                    onOptionChange([...selectedOptions, option]);
                                } else {
                                    onOptionChange(selectedOptions.filter((selectedOption) => selectedOption !== option));
                                }
                            }}
                        />
                    ))}
                </CheckBoxGroup>
            </Dialog>
        </>
    );
}
