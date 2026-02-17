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
    const { chat_id , tg } = useTelegram()
    const [dev, setDev] = useState(false)
    
    useEffect(() => {setDev(process.env.REACT_APP_GOOGLE_SHEETS_URL.slice(-7, -1) === 'devApi')}, [])

    console.log('dev in data context', dev)

    useEffect(() => {
        if(!chat_id)
            return
        const fetchNames = async () => {
        const params = {
            name: 'Ваше имя',
            chatID: chat_id,
            api: 'getName'
        };
        try {
            const response = await axios.post(
                process.env.REACT_APP_GOOGLE_SHEETS_URL,
                JSON.stringify(params),
                
                {
                     headers:  {'Content-Type': dev ? 'application/json' : 'text/plain' }
                }
            ) 
            ;
           setName(response.data || {});
            setEmail(response.data.email || '');
            setRegions(response.data.regions || []);
            setNamesEmails(response.data.userNamesMails || []);
            
            
        } catch (error) {
            console.error('Error fetching regions:', error);
            return
        }
        
    } 
    fetchNames();
    
    const fetchTypesAndStatuses = async () => {
        // console.log('fetchTypesAndStatuses');
        const params = {
            chatID: chat_id,
            api: 'getTypesAndStatuses'
        };
        try {
            const response = await axios.post(
                process.env.REACT_APP_GOOGLE_SHEETS_URL,
                JSON.stringify(params),
                 {
        headers: { 'Content-Type': dev ? 'application/json' : 'text/plain' }
      }
            );
            console.log('TS response', response.data);
            setTypes(response.data.types || []);
            setStatuses(response.data.statuses || []);
            setTitles(response.data.titles || []);
            setActivityPurposes(response.data.activityPurposes || []);
            setActivityTypes(response.data.activityTypes || []);
            
        } catch (error) {
            console.error('Error fetching types and statuses:', error);
        }
    }
    fetchTypesAndStatuses();
    setLoading(false)
}, [chat_id, dev]);

    useEffect(() => {
        if (loading) {
            tg.ready();
            tg.BackButton.hide();
        }
    }, [loading, tg]);
    console.log('name in data context', name)
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
            dev
            
        }}>
            {children}
        </DataContext.Provider>
    );
};