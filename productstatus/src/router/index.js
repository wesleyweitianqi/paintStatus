import App from "../App";
import { createBrowserRouter } from "react-router-dom";
import Status from "../components/Status";
import Shipping from "../components/Shipping";
import Powder from "../components/Powder";
import CoreClamp from "../components/CoreClamp";

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
        path: "/paint",
        element: <Status />,
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
    ],
  },
]);

export default router;
