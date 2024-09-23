import App from "../App";
import { createBrowserRouter } from "react-router-dom";
import Status from "../components/Status";
import Paint from "../components/Paint";
import Shipping from "../components/Shipping";
import Powder from "../components/Powder";
import CoreClamp from "../components/CoreClamp";
import Shear from "../components/Shear";
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
    ],
  },
]);

export default router;
