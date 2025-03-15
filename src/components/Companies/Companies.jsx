import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import qs from 'qs';

const Companies = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const tg = window.Telegram.WebApp;
    tg.BackButton.show();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = {
                    name: 'Ваше имя', // Здесь вы можете указать любые параметры
                    // Добавьте другие параметры по мере необходимости
                };
        
                // Сериализуем параметры в формате x-www-form-urlencoded
                const formData = JSON.stringify(params);
        
                const response = await axios.post(
                    'https://script.google.com/macros/s/AKfycbx7Nn_FO_uFjbHPkMDApqIS3mtBJkMaAkTvlKXxU8rPzIRTdB24TEQmmRG5QFt47mf2/exec',
                    formData,
                   
                );
        
                const data = response.data; // Обработка ответа
                setRows(data);
                setLoading(false);
                console.log('data is', data)
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