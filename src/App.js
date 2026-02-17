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
import Activities from './components/Activity/Activities.jsx';
import ActivityDetails from './components/Activity/ActivityDetails';
import ActivityEditForm from './components/Activity/ActivityEditForm';
import Contacts from './components/Contacts/Contacts';
import { NotificationProvider } from './components/notifications/NotificationContext.jsx';

function App() {

  const navigate = useNavigate();
  const { tg , showButton} = useTelegram();
  // window.Telegram.WebApp.expand();
  window.Telegram.WebApp.disableVerticalSwipes()
  console.log('init param ', window.Telegram.WebApp)
  console.log('protocol', window.location.protocol)
  showButton({
    isVisible: false
  })
  
  document.documentElement.style.setProperty("--bgColor", "#000000");

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
     console.log('navigate')
      navigate('/');
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
            <Route path="/activities/:id/edit" element={<ActivityEditForm />} />
            <Route path="/contacts/:id" element={<ContactDetails />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/activities/:id" element={<ActivityDetails />} />
          </Routes>
        </div>
      </DataProvider>
    </NotificationProvider>
  );
}
export default App