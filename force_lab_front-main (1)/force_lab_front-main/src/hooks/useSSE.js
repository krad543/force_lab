import { useEffect, useRef } from "react";

export const useSSE = (userId, onMessage) => {
    const eventSourceRef = useRef(null);

    useEffect(() => {
        if (!userId) return;


        const eventSource = new EventSource(
            `http://localhost:8080/api/sse/subscribe?userId=${userId}`
        );
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            console.log("SSE подключено");
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(event.type, data);
            } catch (e) {
                onMessage(event.type, event.data);
            }
        };


        eventSource.addEventListener("training-updated", (event) => {
            console.log("Обновление тренировок:", event.data);
            onMessage("training-updated", JSON.parse(event.data));
        });

        eventSource.addEventListener("participant-added", (event) => {
            console.log("Новый участник:", event.data);
            onMessage("participant-added", JSON.parse(event.data));
        });

        eventSource.addEventListener("attendance-marked", (event) => {
            console.log("Посещение отмечено:", event.data);
            onMessage("attendance-marked", JSON.parse(event.data));
        });

        eventSource.onerror = (error) => {
            console.error(" SSE ошибка:", error);

        };

        return () => {
            eventSource.close();
            console.log("SSE отключено");
        };
    }, [userId]);
};