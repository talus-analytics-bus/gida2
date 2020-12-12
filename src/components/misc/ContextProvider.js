import React, { createContext, useState } from "react";
export const appContext = createContext();

const ContextProvider = ({ children }) => {
  const [data, setData] = useState(defaultContext.data);
  const initialContext = { data, setData };
  return (
    <appContext.Provider value={initialContext}>{children}</appContext.Provider>
  );
};

export const defaultContext = {
  data: { stakeholders: {} },
  setData: () => "",
};

export default ContextProvider;
