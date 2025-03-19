// import '../src/css/theme.css';
import styles from './App.module.css'
import * as React from 'react';
import {  useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import { useTelegram } from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import { Route, Routes } from 'react-router-dom'
import Main from "./components/Main/Main";
import { DataProvider } from './DataContext';
import Companies from './components/Companies/Companies';
import { themeParams } from '@telegram-apps/sdk';

if (themeParams) {
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






function App() {
    // eslint-disable-next-line no-unused-vars
    console.log('themeParams', themeParams)    
    const navigate = useNavigate();
    const { onToggleButton, tg } = useTelegram();
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.disableVerticalSwipes()
    tg.MainButton.hide()
    tg.MainButton.setParams({
        text: `Отправить`
    })
     React.useEffect(() => {
        const tg = window.Telegram.WebApp;
        if (tg.platform === 'desktop') {
          tg.setViewSettings({
            width: 800,
            height: 600,
          });
        }
          tg.BackButton.hide();
        }, [navigate])
    var appStyleClassName = ''
    const bgColorInput = document.getElementById("bg-color");

    if (window.Telegram.WebApp.colorScheme === 'dark') {
        appStyleClassName = 'AppDark';
        document.documentElement.style.setProperty("--bgColor", "#000000");
        tg.setHeaderColor("#000000");
    }
    else {
        appStyleClassName = 'AppLight';
        document.documentElement.style.setProperty("--bgColor", "#ffffff");
        tg.setHeaderColor("#ffffff")
    }
    console.log('scheme', window.Telegram.WebApp.colorScheme)

    useEffect(() => {
        tg.ready();
        const fontFamily = tg.platform === 'desktop' ? 'Open Sans, sans-serif' : 'system-ui, sans-serif';
        const bgColor = tg.colorScheme === 'dark' ? '#000000' : '#ffffff';
        const textColor = tg.colorScheme === 'dark' ? '#ffffff' : '#000000';

        document.documentElement.style.setProperty('--fontFamily', fontFamily);
        document.documentElement.style.setProperty('--bgColor', bgColor);
        document.documentElement.style.setProperty('--textColor', textColor);

        document.body.style.fontFamily = fontFamily;
        document.body.style.backgroundColor = bgColor;
        document.body.style.color = textColor;
    }, [tg])

    const divContainer = document.getElementById("App");
    

    return (
        <DataProvider>
        <div className={App}>
            <Header />
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/companies" element={<Companies />} />
                
            </Routes>
        </div>
       
        </DataProvider>
    );
}

export default App