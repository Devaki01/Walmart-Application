import React, { useEffect } from 'react';

function MessageDisplay({ message, clearMessage }) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                clearMessage();
            }, 5000); // Message disappears after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [message, clearMessage]);

    if (!message) return null;

    return (
        <div className="message-display">
            <p>{message}</p>
            <button onClick={clearMessage}>&times;</button>
        </div>
    );
}

export default MessageDisplay;

