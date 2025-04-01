import React, { createContext, useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import axios from 'axios';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { initDataRaw } = retrieveLaunchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [name, setName] = useState('');

    const tg = window.Telegram.WebApp;
  const params = new URLSearchParams(tg.initData);
  const chat_id = JSON.parse(params.get('user')).id;

    useEffect(() => {
        const fetchData = async () => {
          try {
            const params = {
              name: 'Ваше имя',
              chatID: chat_id,
              api: 'getName'
            };
    
            // Сериализуем параметры в формате x-www-form-urlencoded
            const formData = JSON.stringify(params);
    
            const response = await axios.post(
              process.env.REACT_APP_GOOGLE_SHEETS_URL,
              formData,
            );
    
            const data = response.data; // Обработка ответа
            setName(data);
          } catch (error) {
            console.error('Error fetching data:', error);
            setError(error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchData();
      }, [chat_id]);

   

    console.log('DataContext', name.regions)

    return (
        <DataContext.Provider value={{ name , loading , error}}>
            {children}
        </DataContext.Provider>
    );
};

