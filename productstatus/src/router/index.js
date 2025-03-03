import App from "../App";
import { createBrowserRouter } from "react-router-dom";
import Status from "../components/Status";
import Paint from "../components/Paint";
import Shipping from "../components/Shipping";
import Powder from "../components/Powder";
import CoreClamp from "../components/CoreClamp";
import Shear from "../components/Shear";
import Priority from "../components/Priority";
import Setting from "../components/Setting";
import Bending from "../components/Bending";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Status />,
        meta: {
          title: "default",
        },
      },
      {
        path: "/status",
        element: <Status />,
        meta: {
          title: "default",
        },
      },
      {
        path: "/priority",
        element: <Priority />,
        meta: {
          title: "default",
        },
      },
      {
        path: "/paint",
        element: <Paint />,
        meta: {
          title: "painting",
        },
      },
      {
        path: "/ship",
        element: <Shipping />,
        meta: {
          title: "shipping",
        },
      },
      {
        path: "/powder",
        element: <Powder />,
        meta: {
          title: "shipping",
        },
      },
      {
        path: "/coreclamp",
        element: <CoreClamp />,
        meta: {
          title: "coreclamp",
        },
      },
      {
        path: "/shear",
        element: <Shear />,
        meta: {
          title: "coreclamp",
        },
      },
      {
        path: "/bend",
        element: <Bending />,
        meta: {
          title: "bending",
        },
      },
      {
        path: "/setting",
        element: <Setting />,
        meta: {
          title: "setting",
        },
      },
    ],
  },
]);

export default router;
