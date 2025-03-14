import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';

const Companies = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const tg = window.Telegram.WebApp;
    tg.BackButton.show();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post('https://script.google.com/macros/s/AKfycbwCzWyBGoGCMEHIRTIB5HP6VqcwpbZrJnUgT-HimZHHhVxCHlSz9USgECSYzV1FDKOqkQ/exec');
                const data = response.data; // Adjust this based on the structure of your Google Sheets API response
                setRows(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'industry', headerName: 'Industry', width: 150 },
        { field: 'location', headerName: 'Location', width: 150 },
        // Add more columns as needed
    ];

    return (
        <div style={{ height: 400, width: '100%' }}>
            <Paper sx={{ height: 400, width: '100%' }}>
            <DataGrid rows={rows} columns={columns} loading={loading} />
            </Paper>
        </div>
    );
};

export default Companies;