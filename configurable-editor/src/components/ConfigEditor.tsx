import {
    Box,
    Card,
    CardContent,
    Container,
    Typography,
} from "@material-ui/core";
import React from "react";

interface ConfigEditorProps {
    children: JSX.Element;
}

function ConfigEditor(props: ConfigEditorProps) {
    const { children } = props;
    return (
        <Box sx={{ mt: 5 }}>
            <Container maxWidth="sm">
                <Card variant="outlined">
                    <CardContent>
                        <Box m={2} pt={3} style={{ textAlign: "center" }}>
                            <Typography
                                gutterBottom={true}
                                variant="h5"
                                component="div"
                            >
                                Configurable Editor
                            </Typography>
                        </Box>
                        <Box m={3} p={1}>
                            {children}
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}

export default ConfigEditor;
