import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useTelegram } from './hooks/useTelegram';

import { set } from 'lodash';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {

    const [regions, setRegions] = useState([]);
    const [types, setTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [titles, setTitles] = useState([]);
    const [activityTypes, setActivityTypes] = useState([]);
    const [activityPurposes, setActivityPurposes] = useState([]);
    const [namesEmails, setNamesEmails] = useState([]);
    const [name, setName] = useState({});
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const { chat_id, tg } = useTelegram()

    useEffect(() => {
        if (!chat_id)
            return
        const apiUrl = process.env.REACT_APP_DEV === "1" ? process.env.REACT_APP_LOCAL_URL : process.env.REACT_APP_GOOGLE_SHEETS_URL
        const headers = process.env.REACT_APP_DEV === "1" ?
            {
                'Content-Type': 'application/json'
            } :
            {
                'Content-Type': 'text/plain'
            }

        const fetchNames = async () => {
            let params = {
                name: 'Ваше имя',
                chatID: chat_id,
                api: 'getName'
            };
            params = process.env.REACT_APP_DEV === "1" ? params: JSON.stringify(params)
            try {
               const response = await axios.post(
                    apiUrl,
                    params,
                    headers
                );
                setName(response.data || {});
                setEmail(response.data.email || '');
                setRegions(response.data.regions || []);
                setNamesEmails(response.data.userNamesMails || []);

            } catch (error) {
                console.error('Error fetching regions:', error);
            }
        };
        const fetchTypesAndStatuses = async () => {
            // console.log('fetchTypesAndStatuses');
            let params = {
                chatID: chat_id,
                api: 'getTypesAndStatuses'
            };
             params = process.env.REACT_APP_DEV === "1" ? params: JSON.stringify(params)
            try {
                const response = await axios.post(
                    apiUrl,
                    params,
                    headers
                );
                // console.log('TS response', response.data);
                setTypes(response.data.types || []);
                setStatuses(response.data.statuses || []);
                setTitles(response.data.titles || []);
                setActivityPurposes(response.data.activityPurposes || []);
                setActivityTypes(response.data.activityTypes || []);

            } catch (error) {
                console.error('Error fetching types and statuses:', error);
            }
        };
        fetchNames();
        fetchTypesAndStatuses();
        Promise.all([fetchNames(), fetchTypesAndStatuses()]).then(() => {
            setLoading(false);
        });
    }, [chat_id]);

    const provided = { cnt: 0 };

    useEffect(() => {
        if (loading) {
            tg.ready();
            tg.BackButton.hide();
        }
    }, [loading, tg]);
    // console.log('name', types)
    return (
        <DataContext.Provider value={{
            loading,
            chat_id,
            name,
            types,
            titles,
            statuses,
            activityTypes,
            activityPurposes,
            regions,
            namesEmails,
            email,
            provided

        }}>
            {children}
        </DataContext.Provider>
    );
};