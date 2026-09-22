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
import { useAuth } from "./context/AuthContext";
import { User } from "lucide-react";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Everything below renders inside the sidebar + topbar shell (Layout) */}
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/intickets" element={<TicketList />} />
        <Route path="/outtickets" element={<TicketList/>}/>
        <Route path="/mytickets" element={<TicketList/>}/>
        <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/users" element={<Users/>}/>
        <Route path="/departments" element={<Departments/>}/>
        <Route path="/email-templates" element={<EmailTemplates/>}/>
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound/>} />
    </Routes>
  );
}
