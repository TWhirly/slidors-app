import React, { createContext, useEffect, useState } from 'react';
import { localUrl } from './localSettings'
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import axios from 'axios';
const APIURL = localUrl.APIURL;

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { initDataRaw, initData } = retrieveLaunchParams();
    const [stationId, setData] = useState(null);
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
              'https://script.google.com/macros/s/AKfycbxU87ggm05TZS2PTVxyzxv9ixJBZCH6Uz-blFlq4QhJx3S0R4EWjb4LAo1tarSfL6g6BQ/exec',
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

   

    console.log('DataContext', initDataRaw)

    return (
        <DataContext.Provider value={{ name , loading }}>
            {children}
        </DataContext.Provider>
    );
};

