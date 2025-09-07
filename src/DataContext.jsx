import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { set } from 'lodash';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [regions, setRegions] = useState([]);
    const [types, setTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [titles, setTitles] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const tg = window.Telegram.WebApp;
    const params = new URLSearchParams(tg.initData);
    const chat_id = JSON.parse(params.get('user')).id;

    

    

    useEffect(() => {
        const fetchRegions = async () => {
        const params = {
            name: 'Ваше имя',
            chatID: chat_id,
            api: 'getName'
        };
        try {
            const response = await axios.post(
                process.env.REACT_APP_GOOGLE_SHEETS_URL,
                JSON.stringify(params)
            );
            console.log('response', response.data);
            setName(response.data || '');
            setEmail(response.data.email || '');
            setRegions(response.data.regions || []);
            
        } catch (error) {
            console.error('Error fetching regions:', error);
        }
    };
    const fetchTypesAndStatuses = async () => {
        console.log('fetchTypesAndStatuses');
        const params = {
            chatID: chat_id,
            api: 'getTypesAndStatuses'
        };
        try {
            const response = await axios.post(
                process.env.REACT_APP_GOOGLE_SHEETS_URL,
                JSON.stringify(params)
            );
            setTypes(response.data.types || []);
            setStatuses(response.data.statuses || []);
            setTitles(response.data.titles || []);
        } catch (error) {
            console.error('Error fetching types and statuses:', error);
        }
    };
        fetchRegions();
        fetchTypesAndStatuses();
        Promise.all([fetchRegions(), fetchTypesAndStatuses()]).then(() => {
            setLoading(false);
        });
    }, [chat_id]);

    useEffect(() => {
        if (loading) {
            tg.ready();
            tg.BackButton.hide();
        }
    }, [loading, tg]);

    return (
        <DataContext.Provider value={{
            loading,
            chat_id,
            name,
            email,
            regions,
            types,
            titles,
            statuses
        }}>
            {children}
        </DataContext.Provider>
    );
};