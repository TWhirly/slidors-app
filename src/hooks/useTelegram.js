
import { useState } from "react";

export function useTelegram() {

    const tg = window.Telegram.WebApp;

    const onClose = () => {
        tg.close()
    }

    const onToggleButton = () => {
        if(tg.MainButton.isVisible) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
        }
    }

    return {
        onClose1: onClose,
        onToggleButton,
        tg,
        initData: tg.initData,
        dataunsafe: tg.initDataUnsafe,
        user: tg.initDataUnsafe?.user,
        chat_id: tg.initDataUnsafe.user.id.toString(),
        queryId: tg.initDataUnsafe?.query_id,
    }
}