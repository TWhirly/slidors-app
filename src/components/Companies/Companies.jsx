import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { Button, CircularProgress, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const Companies = () => {
    const [rows, setRows] = useState([]);
    const [regionRows, setRegionRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState(null);

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
                    chatID: chat_id,
                    api: 'getCompanies'
                };
        
                // Сериализуем параметры в формате x-www-form-urlencoded
                const formData = JSON.stringify(params);
        
                const response = await axios.post(
                    'https://script.google.com/macros/s/AKfycbxU87ggm05TZS2PTVxyzxv9ixJBZCH6Uz-blFlq4QhJx3S0R4EWjb4LAo1tarSfL6g6BQ/exec',
                    formData,
                );
        
                const data = response.data; // Обработка ответа
                data.sort((a, b) => a.name.localeCompare(b.name)); // Sort data by company name
                setRows(data);
                const regions = data.reduce((acc, item) => {
                    if (!acc.find(({ id }) => id === item.region)) {
                        acc.push({ id: item.region });
                    }
                    return acc;
                }, []);
                regions.sort((a, b) => a.id.localeCompare(b.id));
                setRegionRows(regions);
                setLoading(false);
                console.log('data is', data)
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        
        fetchData();

        // Add event listener for back button
        tg.BackButton.onClick(() => {
            window.history.back();
        });

        return () => {
            // Clean up the event listener
            tg.BackButton.offClick();
        };
    }, []);

    const handleRegionClick = (regionId) => {
        if (selectedRegion === regionId) {
            setSelectedRegion(null);
        } else {
            setSelectedRegion(regionId);
        }
    };

    const columns = [
        { field: 'name', headerName: 'Наименование', width: 150 },
        { field: 'type', headerName: 'Тип', width: 150 },
        { field: 'status', headerName: 'Статус', width: 150 },
        { field: 'tt', headerName: 'Торговых точек', width: 150 },
        { field: 'dealers', headerName: 'Дилеров', width: 150 },
        { field: 'manager', headerName: 'Менеджер', width: 150 },
        // Add more columns as needed
    ];

    return (
        <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {loading ? (
                <CircularProgress style={{display: 'flex',
                    justifyContent: 'center',
                    marginTop: '45vh'}}/>
            ) : (
                <Paper sx={{ height: `100%`, width: '100%' }}>
                    <div>
                        {regionRows.map((region) => (
                            <div key={region.id} style={{ marginBottom: '10px' }}>
                                <Button 
                                    onClick={() => handleRegionClick(region.id)} 
                                    style={{ width: '100%', justifyContent: 'space-between' }}
                                >
                                    {region.id}
                                    <IconButton>
                                        {selectedRegion === region.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </Button>
                                {selectedRegion === region.id && (
                                    <div style={{ marginTop: '10px' }}>
                                        <DataGrid 
                                            rows={rows.filter((row) => row.region === selectedRegion)} 
                                            columns={columns} 
                                            loading={loading} 
                                            autoHeight
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Paper>
            )}
        </div>
    );
};

export default Companies;
