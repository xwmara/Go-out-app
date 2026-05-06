import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import OrganizerLayout from "./components/layout/OrganizerLayout";
import OrganizerEventLayout from "./components/layout/OrganizerEventLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicOnlyRoute from "./components/common/PublicOnlyRoute";

import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerEvents from "./pages/OrganizerEvents";
import OrganizerMarketing from "./pages/OrganizerMarketing";
import OrganizerEventOverview from "./pages/OrganizerEventOverview";
import OrganizerEventTickets from "./pages/OrganizerEventTickets";
import OrganizerEventFiscalization from "./pages/OrganizerEventFiscalization";
import OrganizerEventPromotion from "./pages/OrganizerEventPromotion";
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
      { path: "/", element: <Home /> },
      { path: "/events", element: <Events /> },
      { path: "/events/:id", element: <EventDetails /> },
      { path: "/search", element: <Search /> },
      {
        element: <ProtectedRoute allowedRoles={["client"]} />,
        children: [
          { path: "/my-tickets", element: <MyTickets /> },
          { path: "/profile", element: <Profile /> },
        ],
      },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["organizer"]} />,
    children: [
      {
        element: <OrganizerLayout />,
        children: [
          { path: "/organizer/dashboard", element: <OrganizerDashboard /> },
          { path: "/organizer/events", element: <OrganizerEvents /> },
          { path: "/organizer/marketing", element: <OrganizerMarketing /> },
          { path: "/organizer/profile", element: <Profile /> },
          { path: "/organizer/events/create", element: <CreateEvent /> },
        ],
      },
      {
        path: "/organizer/events/:id",
        element: <OrganizerEventLayout />,
        children: [
          { index: true, element: <Navigate to="overview" replace /> },
          { path: "overview", element: <OrganizerEventOverview /> },
          { path: "edit", element: <EditEvent /> },
          { path: "tickets", element: <OrganizerEventTickets /> },
          { path: "fiscalizare", element: <OrganizerEventFiscalization /> },
          { path: "promovare", element: <OrganizerEventPromotion /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [{ path: "/admin", element: <AdminDashboard /> }],
      },
    ],
  },
]);
