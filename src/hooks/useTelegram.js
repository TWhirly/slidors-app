
import { useCallback, useRef } from "react";

export function useTelegram() {

    const tg = window.Telegram?.WebApp;
    const mainButton = tg?.MainButton;
    const mainButtonHandlerRef = useRef(null);

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
      onClick
    } = params;
    mainButton.setText(text);
    mainButton.setParams({
      text_color: textColor,
      
    });

    if (mainButtonHandlerRef.current) {
      mainButton.offClick(mainButtonHandlerRef.current);
      mainButtonHandlerRef.current = null;
    }

    if (onClick && isActive) {
      mainButton.onClick(onClick);
      mainButtonHandlerRef.current = onClick;
      mainButton.enable();
    } else {
      mainButton.disable();
    }

    if (isVisible && !mainButton.isVisible) {
      mainButton.show();
    } else if (!isVisible && mainButton.isVisible) {
      mainButton.hide();
    }
  }, [mainButton]);

   const hideButton = useCallback(() => {
    if (!mainButton) return;
    if (mainButtonHandlerRef.current) {
      mainButton.offClick(mainButtonHandlerRef.current);
      mainButtonHandlerRef.current = null;
    }
    if (mainButton.isVisible) {
      mainButton.hide();
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
        initData: tg?.initData,
        dataunsafe: tg?.initDataUnsafe,
        user: tg?.initDataUnsafe?.user,
        chat_id: tg?.initDataUnsafe?.user?.id?.toString(),
        queryId: tg?.initDataUnsafe?.query_id,
    }
}
