import React, { createContext, useEffect, useState } from 'react';
import { localUrl } from './localSettings'
import { retrieveLaunchParams } from '@telegram-apps/sdk';
const APIURL = localUrl.APIURL;

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { initDataRaw, initData } = retrieveLaunchParams();
    const [stationId, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

   

    console.log('DataContext', initDataRaw)

    return (
        <DataContext.Provider value={{ initDataRaw , initData }}>
            {children}
        </DataContext.Provider>
    );
};

