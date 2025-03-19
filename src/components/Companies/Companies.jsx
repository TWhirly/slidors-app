import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { Button, CircularProgress, IconButton } from '@mui/material';
import { themeParams } from '@telegram-apps/sdk';



const Companies = () => {
    if (themeParams) {
        console.log('themeParams', themeParams)
        const { bg_color, text_color, hint_color, button_color, button_text_color } = themeParams;
    
        if (bg_color) {
            document.documentElement.style.setProperty('--bgColor', bg_color);
            document.body.style.backgroundColor = bg_color;
        }
        if (text_color) {
            document.documentElement.style.setProperty('--textColor', text_color);
            document.body.style.color = text_color;
        }
        if (hint_color) {
            document.documentElement.style.setProperty('--hintColor', hint_color);
        }
        if (button_color) {
            document.documentElement.style.setProperty('--buttonColor', button_color);
        }
        if (button_text_color) {
            document.documentElement.style.setProperty('--buttonTextColor', button_text_color);
        }
    }
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
                    const existingRegion = acc.find(({ id }) => id === item.region);
                    if (existingRegion) {
                        existingRegion.count += 1;
                    } else {
                        acc.push({ id: item.region, count: 1 });
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

    const formatRegionName = (regionId) => {
        const region = rows.find((row) => row.region === regionId);
        return region ? region.region : regionId;
    };
    console.log('reg rows', regionRows)
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {loading ? (
          <CircularProgress
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "45vh",
            }}
          />
        ) : (
          <Paper sx={{ height: `100%`, width: "100%" }}>
            <div>
              {regionRows.map((region) => (
                <div key={region.id} style={{ marginBottom: "10px" }}>
                  <button
                    onClick={() => handleRegionClick(region.id)}
                    style={{
                      backgroundColorcolor: themeParams?.buttonColor || "black",
                      width: "100%",
                      justifyContent: "flex-start",
                      border: "none",
                      padding: "1px 0",
                      background: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      height: "auto",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "16px",
                      }}
                    >
                      {region.id} ({region.count})
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          marginLeft: "8px",
                          borderLeft: "6px solid transparent",
                          borderRight: "6px solid transparent",
                          borderTop: "6px solid black",
                          // borderTop: selectedRegion === region.id ? 'none' : '6px solid black',
                          // borderBottom: selectedRegion === region.id ? '6px solid black' : 'none',
                        }}
                      />
                    </span>
                  </button>
                  {selectedRegion === region.id && (
                    <div style={{ marginTop: "10px" }}>
                      <DataGrid
                        rows={rows.filter(
                          (row) => row.region === selectedRegion
                        )}
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
