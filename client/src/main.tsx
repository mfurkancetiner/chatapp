import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import { WebsocketProvider } from './contexts/WebsocketContext'
import { Chat } from './components/Chat'
import LoginForm from "./components/Auth";


const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginForm></LoginForm>,
  },
  {
    path: "chat/:id?",
    element: <WebsocketProvider><Chat/></WebsocketProvider>
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);