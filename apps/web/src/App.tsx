import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TicketList from "./pages/TicketList";
import TicketDetail from "./pages/TicketDetail";
import Teams from "./pages/Teams";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Departments from "./pages/Department";
import EmailTemplates from "./pages/EmailTemplate";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoutes";
import NewTicket from "./pages/NewTicket";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/intickets" element={<TicketList />} />

          <Route path="/outtickets" element={<TicketList />} />

          <Route path="/mytickets" element={<TicketList />} />

          <Route path="/tickets/new" element={<NewTicket />} />

          <Route path="/tickets/:id" element={<TicketDetail />} />

          <Route path="/teams" element={<Teams />} />

          <Route
            path="/email-templates"
            element={<EmailTemplates />}
          />

          <Route path="/settings" element={<Settings />} />

          <Route
            element={
              <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]} />
            }
          >
            <Route path="/users" element={<Users />} />

            <Route
              path="/departments"
              element={<Departments />}
            />
          </Route>

          {/* SUPER_ADMIN only */}
          {/* Add management route here when the page is ready */}
          {/* 
          <Route
            element={
              <ProtectedRoute roles={["SUPER_ADMIN"]} />
            }
          >
            <Route
              path="/management"
              element={<Management />}
            />
          </Route>
          */}
        </Route>
      </Route>

      {/* Not found / unauthorized */}
      <Route path="/not-found" element={<NotFound />} />

      {/* Unknown URLs */}
      <Route
        path="*"
        element={<Navigate to="/not-found" replace />}
      />
    </Routes>
  );
}