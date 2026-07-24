import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const [activeCall, setActiveCall] = useState(null);
  const timerRef = useRef(null);

  const startCall = (client) => {
    if (activeCall) return; // Only 1 active call allowed at a time
    setActiveCall({
      client,
      status: 'connecting',
      seconds: 0,
      startTime: new Date()
    });
  };

  const endCall = () => {
    setActiveCall(prev => {
      if (!prev) return null;
      return { ...prev, status: 'ended' };
    });
  };

  const cancelCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveCall(null);
  };

  useEffect(() => {
    if (!activeCall) return;

    if (activeCall.status === 'connecting') {
      const connTimeout = setTimeout(() => {
        setActiveCall(prev => prev && prev.status === 'connecting' ? { ...prev, status: 'ringing' } : prev);
      }, 1500);
      return () => clearTimeout(connTimeout);
    }

    if (activeCall.status === 'ringing') {
      const ringTimeout = setTimeout(() => {
        setActiveCall(prev => prev && prev.status === 'ringing' ? { ...prev, status: 'connected' } : prev);
      }, 1500);
      return () => clearTimeout(ringTimeout);
    }

    if (activeCall.status === 'connected') {
      timerRef.current = setInterval(() => {
        setActiveCall(prev => {
          if (!prev || prev.status !== 'connected') return prev;
          return { ...prev, seconds: prev.seconds + 1 };
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [activeCall?.status]);

  return (
    <CallContext.Provider value={{ activeCall, startCall, endCall, cancelCall, setActiveCall }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
