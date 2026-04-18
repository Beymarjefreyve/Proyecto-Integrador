import { createBrowserRouter } from "react-router";
import { Home } from "./components/home";
import { FaceScan } from "./components/face-scan";
import { Success } from "./components/success";
import { Error } from "./components/error";
import { Register } from "./components/register";
import DashboardApp from "./components/dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/scan",
    Component: FaceScan,
  },
  {
    path: "/success",
    Component: Success,
  },
  {
    path: "/error",
    Component: Error,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/dashboard",
    Component: DashboardApp,
  },
]);
