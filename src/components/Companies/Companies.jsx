import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import qs from 'qs';

const Companies = () => {
    const [rows, setRows] = useState([]);
    const [regionRows, setRegionRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [regionsListShow, setRegionsListShow] = useState(true);

    const tg = window.Telegram.WebApp;
    const params = new URLSearchParams(window.Telegram.WebApp.initData);
    const chat_id = JSON.parse(params.get('user')).id;
    console.log('chat_id', chat_id)
    tg.BackButton.show();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = {
                    name: 'Ваше имя',
                    chatID: chat_id // Здесь вы можете указать любые параметры
                    // Добавьте другие параметры по мере необходимости
                };
        
                // Сериализуем параметры в формате x-www-form-urlencoded
                const formData = JSON.stringify(params);
        
                const response = await axios.post(
                    'https://script.google.com/macros/s/AKfycbyIMtJO_s6n2I7QiYjaFGykwDKL6yUuobMDMvPdu2Z6BkYG4MNLZ5ZMe9fZt1Ux2v54tA/exec',
                    formData,
                   
                );
        
                const data = response.data; // Обработка ответа
                setRows(data);
                setRegionRows(data.reduce((acc, item) => {
                    if (!acc.find(({ id }) => id === item.region)) {
                        acc.push({ id: item.region });
                    }
                    return acc;
                }, []));
                setLoading(false);
                console.log('data is', data)
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        

        fetchData();
    }, []);

    const handleRowClick = (params) => {
        const id = params.id;
        console.log('Row clicked, id:', id);
        // Add your logic here to handle the row click event
    };

    const regionColumns = [
        
        { field: 'id', headerName: 'Регион', width: 340 }
        
        // Add more columns as needed
    ];

    const columns = [
        { field: 'name', headerName: 'Наименование', width: 150 },
        { field: 'type', headerName: 'Тип', width: 150 },
        { field: 'region', headerName: 'Регион', width: 150 },
        { field: 'city', headerName: 'Город', width: 150 },
        // Add more columns as needed
    ];

    return (
        <div style={{ height: 400, width: '100%' }}>
            <Paper sx={{ height: 400, width: '100%' }}>
                {regionsListShow && (
                    <DataGrid 
                        rows={regionRows} 
                        columns={regionColumns} 
                        loading={loading} 
                        onRowClick={handleRowClick} 
                    />
                )}
            </Paper>
        </div>
    );
};

export default Companies;