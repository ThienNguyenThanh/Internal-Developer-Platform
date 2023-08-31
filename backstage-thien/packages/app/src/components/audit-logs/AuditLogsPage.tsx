import React from "react";
import { AppBar, Box, Grid, IconButton, InputAdornment, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TextField, Toolbar, Typography, useTheme } from "@material-ui/core";
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Search from '@material-ui/icons/Search';
import "./auditLogs.css";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

// // DUMMY DATA
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

// Actual data
const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const loadAuditData = async () => {
    const command = new ScanCommand({
        ProjectionExpression: "#Name, Time, Username, Source, resourceType, resourceName",
        ExpressionAttributeNames: { "#Name": "Name" },
        TableName: "Audit",
    });

    const response = await docClient.send(command);
    console.log(response)
    for (const audit of response?.Items!) {
        console.log(audit);
    }
    return response.Items;
};

loadAuditData().then( function(result) {
    console.log(result)
});

// PAGINATION
interface TablePaginationActionsProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (
        event: React.MouseEvent<HTMLButtonElement>,
        newPage: number,
    ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}

// FILTER SECTION
function TableFilterBar() {
    return (
        <Box
            id="table-filter-bar"
            component="form"
        >
            {/* Trying to make the search box in the last order when in mobile view but fail because the React MUI does not support Item stack order in grid components */}
            <Toolbar>
                <Grid container spacing={1}>
                    <Grid item xs={6} md={3} lg={2} >
                        <TextField
                            id="attribute-select"
                            select
                            label="Lookup attributes"
                            defaultValue="all"
                            variant="outlined"
                        >
                            <MenuItem key="all" value="all">
                                All
                            </MenuItem>
                            {attributes.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6} md={6} lg={8} >
                        <TextField
                            id="search-box"
                            type="search"
                            placeholder="Search here..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} md={3} lg={2} >
                        <TextField
                            id="date-input"
                            type="date"
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </Toolbar>
        </Box>
    );
}

const attributes = [
    {
        value: 'name',
        label: 'Event name',
    },
    {
        value: 'time',
        label: 'Event time',
    },
    {
        value: 'username',
        label: 'User name',
    },
    {
        value: 'source',
        label: 'Event source',
    },
    {
        value: 'resourceType',
        label: 'Resource type',
    },
    {
        value: 'resourceName',
        label: 'Resource name',
    }
]

// MAIN FUNCTION
export const AuditLogsPage = () => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(30);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const handleChangePage = (
        _event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <>
            {/* Header section */}
            <Box sx={{ flexGrow: 1 }} >
                <AppBar position="static" style={{ padding: '10px 20px', background: '#366' }}>
                    <Typography variant="h3" className="header-title">Event logs</Typography>
                    <Typography variant="subtitle1" className="header-subtitle">You can trace and manage the logs here.</Typography>
                </AppBar>
            </Box>

            {/* Main setcion */}
            <main className="main-section">
                <Paper>
                    <TableFilterBar />
                    <TableContainer style={{ maxHeight: '100vh', width: '100%', overflow: 'hidden' }} id="audit-table-container">
                        <Table stickyHeader size="small" aria-label="sticky table">
                            {/* Table header */}
                            <TableHead>
                                <TableRow>
                                    {
                                        attributes.map((attribute) => (
                                            <TableCell align="left">{attribute.label}</TableCell>
                                        ))
                                    }
                                </TableRow>
                            </TableHead>

                            {/* Display data */}
                            <TableBody>
                                {(rowsPerPage > 0
                                    ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    : rows
                                ).map((row) => (
                                    <TableRow style={{ height: 50 }}>
                                        <TableCell align="left" component="th" scope="row">{row.name}</TableCell>
                                        <TableCell align="left">{row.time.toString()}</TableCell>
                                        <TableCell align="left">{row.username}</TableCell>
                                        <TableCell align="left">{row.source}</TableCell>
                                        <TableCell align="left">{row.resourceType}</TableCell>
                                        <TableCell align="left">{row.resourceName}</TableCell>
                                    </TableRow >
                                ))}
                                {emptyRows > 0 && (
                                    <TableRow style={{ height: 50 * emptyRows }}>
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                )}
                            </TableBody>

                            {/* Pagination section here */}
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        align="right"
                                        rowsPerPageOptions={[10, 30, 50, { label: 'All', value: -1 }]}
                                        count={rows.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        SelectProps={{
                                            inputProps: {
                                                'aria-label': 'rows per page',
                                            },
                                            native: true,
                                        }}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        ActionsComponent={TablePaginationActions}
                                    />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </Paper>
            </main>
        </>
    );
};