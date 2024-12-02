import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentPaint, setCurrentPaint] = useState(() => {
    const savedData = localStorage.getItem("currentPaint");
    return savedData ? JSON.parse(savedData) : 1;
  });

  useEffect(() => {
    localStorage.setItem("currentPaint", JSON.stringify(currentPaint));
  }, [currentPaint]);

  return (
    <AppContext.Provider value={{ currentPaint, setCurrentPaint }}>
      {children}
    </AppContext.Provider>
  );
};
