import "./App.css";
import { useEffect } from "react";
import Status from "./components/Status";
import "./styles/global.scss";
import Navi from "./components/Navi";
import { Outlet } from "react-router-dom";

function App() {
  useEffect(() => {
    document.title = "Paint Status";
  });
  return (
    <div className="App">
      <Navi />
      <Outlet />
    </div>
  );
}

export default App;
