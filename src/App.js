// import '../src/css/theme.css';
import * as React from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useEffect } from "react";
import { useTelegram } from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import Main from "./components/Main/Main";
import { DataProvider } from './DataContext.jsx';
import Companies from './components/Companies/Companies';
import CompanyDetails from './components/Companies/CompanyDetails';
import ContactDetails from './components/Contacts/ContactDetails';
import CompanyEditForm from './components/Companies/CompanyEditForm';
import ContactEditForm from './components/Contacts/ContactEditForm';
import Contacts from './components/Contacts/Contacts';
import { NotificationProvider } from './components/notifications/NotificationContext.jsx';
import NotificationPanel from './components/notifications/NotificationPanel.jsx';
import { useNotification } from './components/notifications/NotificationContext.jsx';

function App() {



    // eslint-disable-next-line no-unused-vars
    // const { showNotification } = useNotification();
    const navigate = useNavigate();
    const { tg } = useTelegram();
    // window.Telegram.WebApp.expand();
    window.Telegram.WebApp.disableVerticalSwipes()

    tg.MainButton.hide()
    tg.MainButton.setParams({
        text: `Отправить`
    })
    //  React.useEffect(() => {
    //     const tg = window.Telegram.WebApp;
    //       tg.BackButton.hide();
    //     }, [navigate])

    // if (window.Telegram.WebApp.colorScheme === 'dark') {
    document.documentElement.style.setProperty("--bgColor", "#000000");

    // }
    // else {
    //     document.documentElement.style.setProperty("--bgColor", "#ffffff");
    //     tg.setHeaderColor("#ffffff")
    // }
    // console.log('scheme', window.Telegram.WebApp.colorScheme)

    useEffect(() => {
        tg.ready();
        const fontFamily = tg.platform === 'desktop' ? 'Open Sans, sans-serif' : 'system-ui, sans-serif';
        const textColor = '#ffffff';

        document.documentElement.style.setProperty('--fontFamily', fontFamily);
        document.documentElement.style.setProperty('--textColor', textColor);

        document.body.style.fontFamily = fontFamily;
        window.Telegram.WebApp.exitFullscreen();
        document.body.style.color = textColor;
        tg.setHeaderColor("#131313");
        tg.setBackgroundColor("#131313");
    }, [tg])
    
    useEffect(() => {
    // Обработка Telegram WebApp параметров
    if (window.Telegram?.WebApp?.initData) {
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      const path = urlParams.get('tgWebAppStartParam') || '/';
      
      // Перенаправляем на корректный путь
      navigate(path);
    }
  }, []);

    return (
    <NotificationProvider>
      <DataProvider>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/companies/:id" element={<CompanyDetails />} />
            <Route path="/companies/:id/edit" element={<CompanyEditForm />} />
            <Route path="/contacts/:id/edit" element={<ContactEditForm />} />
             <Route path="/contacts/:id" element={<ContactDetails />} />
          </Routes>
        </div>
      </DataProvider>
    </NotificationProvider>
  );
}



export default App