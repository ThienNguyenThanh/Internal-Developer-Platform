import React from "react";
import { AppBar, Box, Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@material-ui/core";
import "./eventLogs.css";

// DUMMY DATA
function createData(
    name: string,
    time: Date,
    username: string,
    source: string,
    resourceType: string,
    resourceName: string
) {
    return { name, time, username, source, resourceType, resourceName };
}

const rows = [
    createData('GetResourcePolicy', new Date('5/10/2023 10:21:00'), 'root', 'secretsmanager.amazonaws.com', 'AWS::SecretManager::Secret', 'am:aws:secretmanager:us-east-1:793443493308:secret:secret-for-demo'),
    createData('DescribeSecret', new Date('5/10/2023 10:20:59'), 'root', 'secretsmanager.amazonaws.com', 'AWS::SecretManager::Secret', 'secret-for-demo'),
    createData('UpdateSecret', new Date('5/10/2023 10:20:52'), 'Admin', 'secretsmanager.amazonaws.com', 'AWS::SecretManager::Secret', 'secret-for-demo'),
    createData('GetSecretValue', new Date('5/10/2023 10:20:32'), 'root', 'secretsmanager.amazonaws.com', 'AWS::SecretManager::Secret', 'am:aws:secretmanager:us-east-1:793443493308:secret:secret-for-demo'),
    createData('GetResourcePolicy', new Date('5/10/2023 10:20:30'), 'root', 'secretsmanager.amazonaws.com', 'AWS::SecretManager::Secret', 'am:aws:secretmanager:us-east-1:793443493308:secret:secret-db-w...'),
    createData('GetResourcePolicy', new Date('5/10/2023 10:20:30'), 'root', 'secretsmanager.amazonaws.com', 'AWS::SecretManager::Secret', 'am:aws:secretmanager:us-east-1:793443493308:secret:secret-for-demo'),
    createData('DescribeSecret', new Date('5/10/2023 10:20:30'), 'root', 'secretsmanager.amazonaws.com', 'AWS::SecretManager::Secret', 'secret-for-demo'),
    createData('CreateSecret', new Date('5/10/2023 10:20:17'), 'Admin', 'secretsmanager.amazonaws.com', 'AWS::SecretManager::Secret', 'secret-for-demo'),
    createData('DescribeSecret', new Date('5/10/2023 10:18:55'), 'root', 'secretsmanager.amazonaws.com', 'AWS::SecretManager::Secret', 'secret-db'),
];

// MAIN FUNCTION
export const EventLogsPage = () => {
    return (
        <>
            {/* Header section */}
            <Box sx={{ flexGrow: 1 }} >
                <AppBar position="static" className="header-bar">
                    <Typography variant="h3" className="header-title">Event logs</Typography>
                    <Typography variant="subtitle1" className="header-subtitle">You can trace and manage the logs here.</Typography>
                </AppBar>
            </Box>

            {/* Main setcion */}
            <TableContainer component={Paper} className="table-container">
                <Table stickyHeader size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell><Checkbox color="primary" /></TableCell>
                            <TableCell align="left">Event name</TableCell>
                            <TableCell align="left">Event time</TableCell>
                            <TableCell align="left">Username</TableCell>
                            <TableCell align="left">Event source</TableCell>
                            <TableCell align="left">Resource type</TableCell>
                            <TableCell align="left">Resource name</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow>
                                <TableCell><Checkbox /></TableCell>
                                <TableCell align="left" component="th" scope="row">{row.name}</TableCell>
                                <TableCell align="left">{row.time.toString()}</TableCell>
                                <TableCell align="left">{row.username}</TableCell>
                                <TableCell align="left">{row.source}</TableCell>
                                <TableCell align="left">{row.resourceType}</TableCell>
                                <TableCell align="left">{row.resourceName}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};