import React, { createContext, useState, useEffect } from "react";
import instance from "../src/utils/http";
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentPaint, setCurrentPaint] = useState(null);

  useEffect(() => {
    instance.get("/paint/currentpaint").then((res) => {
      setCurrentPaint(res.data);
    });
  }, []);

  return (
    <AppContext.Provider value={{ currentPaint, setCurrentPaint }}>
      {children}
    </AppContext.Provider>
  );
};
