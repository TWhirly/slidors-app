
import { useCallback, useEffect, useRef } from "react";

export function useTelegram() {

    const tg = useRef(window.Telegram?.WebApp);

    

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
        current.offClick(onclick);
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
      shineEffect = false,
      onClick
    } = params;
    // console.log('params', params)
    mainButton.current.setText(text);
    mainButton.current.setParams({
      text_color: textColor,
      onClick: onClick,
      has_shine_effect: shineEffect
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
    // return(mainButton.current.offClick(onClick))
  }, []);

   const hideButton = useCallback(() => {
    if (mainButton.current?.isVisible) {
      mainButton.current.hide();
      mainButton.current.offClick();
    }
  }, []);

    const onClose = () => {
        tg.close()
    }

    

    return {
        onClose: onClose,
        tg: tg.current,
        showButton, 
        hideButton,
        initData: tg.current.initData,
        dataunsafe: tg.current.initDataUnsafe,
        user: tg.current.initDataUnsafe?.user,
        chat_id: tg.current.initDataUnsafe?.user.id?.toString(),
        queryId: tg.current.initDataUnsafe?.query_id,
    }
}