
import { useCallback, useEffect, useRef } from "react";

export function useTelegram() {

    const tg = window.Telegram.WebApp;

    const mainButton = (window.Telegram?.WebApp?.MainButton);

  //   useEffect(() => {
  //   if (!mainButton.current) return;
    
  //   const current = mainButton.current
  //   // Базовая настройка кнопки
  //   current.setText('Продолжить');
  //   current.disable();
  //   current.hide();
    
  //   return () => {
  //     // Очистка при размонтировании
  //     if (current?.isVisible) {
  //       current.hide();
  //     }
  //   };
  // }, []);

  const showButton = useCallback((params = {}) => {
    if (!mainButton) return;

    const {
      text = 'Продолжить',
      textColor = '#ffffff',
      isActive = true,
      isVisible = true,
      onClick,
      offClick
    } = params;
    console.log('params', params)
     mainButton.offClick();
    mainButton.setText(text);
    mainButton.setParams({
      text_color: textColor,
      
    });

    // Удаляем предыдущий обработчик
    mainButton.offClick(onClick);

    if (onClick && isActive) {
      mainButton.onClick(onClick);
      mainButton.enable();
    } else {
      mainButton.disable();
    }

    if(offClick){
      console.log('tg offClick')
      mainButton.offClick(onClick);
    }

    if (isVisible && !mainButton.isVisible) {
      mainButton.show();
    } else if (!isVisible && mainButton.isVisible) {
      mainButton.hide();
    }
  }, [mainButton]);

   const hideButton = useCallback(() => {
    if (mainButton.isVisible) {
      mainButton.hide();
      mainButton.offClick();
    }
  }, [mainButton]);

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