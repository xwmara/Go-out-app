import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import OrganizerLayout from "./components/layout/OrganizerLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicOnlyRoute from "./components/common/PublicOnlyRoute";

import Home from "./pages/Home";
import Events from "./pages/Events"
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerEvents from "./pages/OrganizerEvents";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import AdminDashboard from "./pages/AdminDashboard";
import MyTickets from "./pages/MyTickets";
import Profile from "./pages/Profile";
import Search from "./pages/Search";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/events",
        element: <Events />,
      },
      {
        path: "/events/:id",
        element: <EventDetails />,
      },
      {
        element: <ProtectedRoute allowedRoles={["client"]} />,
        children: [
          {
            path: "/my-tickets",
            element: <MyTickets />,
          },
          {
            path: "/profile",
            element: <Profile />,
          },
          {
            path: "/search",
            element: <Search />,
          },
        ],
      },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["organizer"]} />,
    children: [
      {
        element: <OrganizerLayout />,
        children: [
          {
            path: "/organizer/dashboard",
            element: <OrganizerDashboard />,
          },
          {
            path: "/organizer/events",
            element: <OrganizerEvents />,
          },
          {
            path: "/organizer/events/create",
            element: <CreateEvent />,
          },
          {
            path: "/organizer/events/:id/edit",
            element: <EditEvent />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "/admin",
            element: <AdminDashboard />,
          },
        ],
      },
    ],
  },
]);
