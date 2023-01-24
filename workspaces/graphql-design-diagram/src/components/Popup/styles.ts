import styled from "@emotion/styled";
import { makeStyles } from "@material-ui/core/styles";

export const Container = styled.div`
    display: flex;
    flex-direction: row;
    font-family: GilmerRegular;
    font-size: 13px;
    letter-spacing: 0.8px;
    padding: 15px;
`;

export const popOverStyle = makeStyles(theme => ({
    popover: {
        pointerEvents: 'none',
    },
    popoverContent: {
        pointerEvents: 'auto',
    },
}));
