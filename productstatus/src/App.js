import "./App.css";
import { useEffect } from "react";
import "./styles/global.scss";
import Navi from "./components/Navi";
import { Outlet } from "react-router-dom";
import { AppProvider } from "./AppContext";

function App() {
  useEffect(() => {
    document.title = "Rex Operator Client";
  });
  return (
    <AppProvider>
      <div className="App">
        <Navi />
        <Outlet />
      </div>
    </AppProvider>
  );
}

export default App;
