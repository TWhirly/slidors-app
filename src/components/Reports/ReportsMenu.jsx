import React, { useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Element } from 'react-scroll';
import styles from '../Companies/Companies.module.css';
import { useTelegram  } from '../../hooks/useTelegram.js';

const ReportsMenu = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const {tg , chat_id, showButton} = useTelegram()
    tg.BackButton.show();
    const menuItems = [
        {name: 'Менеджер СНВ', route: 'snvManager'},
        {name: 'Подписки', route: 'subscribesReport'}
    ]

    const handleSelectItem = (item) => {
        navigate(`/reports/${item.route}`, {
            state: { path: '/reports' }
            //, replace: true
        });
    };

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;
        tg.BackButton.onClick(() => navigate(('/'), { replace: true }));
        return () => {
            tg.BackButton.offClick();
        };
    }, [navigate, tg]);


    return (
        <div className={styles.container}
        >
            <div
                className={styles.naviPanel}
            >
                <div className={styles.companyNamePanel}
                >Отчёты
                </div>
            </div>
            <div
                id='regionsWithCompanies'
                className={styles.allRegions}>
                {menuItems.map((item) => (
                    <Element
                        key={item.name}
                        className={styles.regionContainer}
                        name={item.name}
                        id={`item-${encodeURIComponent(item.name)}`}
                         onClick={() => handleSelectItem(item)}
                    >
                        <button
                            onClick={() => handleSelectItem(item)}
                            className={styles.regionButton}
                        >
                            <span>
                                {item.name}
                            </span>
                        </button>
                        
                    </Element>
                ))}
            </div>
            
        </div>
    );
};

export default ReportsMenu;