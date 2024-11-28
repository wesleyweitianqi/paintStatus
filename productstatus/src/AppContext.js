import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentPaint, setCurrentPaint] = useState("");

  return (
    <AppContext.Provider value={{ currentPaint, setCurrentPaint }}>
      {children}
    </AppContext.Provider>
  );
};
