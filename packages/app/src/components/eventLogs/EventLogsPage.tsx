import React from "react";
import { AppBar, Box, Checkbox, Table, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";

export const EventLogsPage = () => {

    return (
        <>
            {/* Header section */}
            <Box sx={{ flexGrow: 1 }} >
                <AppBar position="static" className="header-bar" style={{ padding: "20px", background: "#366" }}>
                    <Typography variant="h3" className="header-title">Event logs</Typography>
                    <Typography variant="subtitle1" className="header-subtitle">You can trace and manage the logs here.</Typography>
                </AppBar>
            </Box>

            {/* Main setcion */}
            <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Checkbox color="primary" />
                            </TableCell>
                            <TableCell align="left">Event name</TableCell>
                            <TableCell align="left">Event time</TableCell>
                            <TableCell align="left">Username</TableCell>
                            <TableCell align="left">Event source</TableCell>
                            <TableCell align="left">Resource type</TableCell>
                            <TableCell align="left">Resource name</TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>
        </>
    );
};