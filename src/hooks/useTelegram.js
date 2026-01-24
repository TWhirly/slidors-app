
import { useCallback, useEffect, useRef } from "react";

export function useTelegram() {

    const tg = window.Telegram.WebApp;

    const mainButton = useRef(window.Telegram?.WebApp?.MainButton);

    useEffect(() => {
    if (!mainButton.current) return;
    
    const current = mainButton.current
    // Базовая настройка кнопки
    current.setText('Продолжить');
    current.disable();
    current.hide();
    
    return () => {
      // Очистка при размонтировании
      if (current?.isVisible) {
        current.hide();
      }
    };
  }, []);

  const showButton = useCallback((params = {}) => {
    if (!mainButton.current) return;

    const {
      text = 'Продолжить',
      textColor = '#ffffff',
      isActive = true,
      isVisible = true,
      onClick
    } = params;
    console.log('params', params)
    mainButton.current.setText(text);
    mainButton.current.setParams({
      text_color: textColor,
      onClick: onClick
    });

    // Удаляем предыдущий обработчик
    mainButton.current.offClick(onClick);

    if (onClick && isActive) {
      mainButton.current.onClick(onClick);
      mainButton.current.enable();
    } else {
      mainButton.current.disable();
    }

    if (isVisible && !mainButton.current.isVisible) {
      mainButton.current.show();
    } else if (!isVisible && mainButton.current.isVisible) {
      mainButton.current.hide();
    }
  }, []);

   const hideButton = useCallback(() => {
    if (mainButton.current?.isVisible) {
      mainButton.current.hide();
    }
  }, []);

    const onClose = () => {
        tg.close()
    }

    

    return {
        onClose: onClose,
        tg,
        showButton, 
        hideButton,
        initData: tg.initData,
        dataunsafe: tg.initDataUnsafe,
        user: tg.initDataUnsafe?.user,
        chat_id: tg.initDataUnsafe.user.id.toString(),
        queryId: tg.initDataUnsafe?.query_id,
    }
}