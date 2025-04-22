import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InvoiceManagement from "./pages/InvoiceManagement";
import Settings from "./pages/Settings";
import { TimeoffsPage } from "./pages/TimeoffsPage";
import { UsersPage } from "./pages/UsersPage";
import { Navbar } from "./components/Navbar";
import { useUserData } from "./hooks/queries/useUserData";
import { UserRole } from "./types/auth";
import { TeamPage } from "./pages/TeamPage";
import TimeoffsManagementPage from './pages/TimeoffsManagementPage';
const theme = createTheme();

function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) {
  const { data: userData, isLoading } = useUserData();
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (isLoading || !userData) {
    return <CircularProgress />;
  }
  if (roles && !roles.includes(userData.role)) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6">
          You are not authorized to access this page
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: "flex" }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, ml: "240px", p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeoffs"
            element={
              <ProtectedRoute>
                <TimeoffsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeoffs/manage"
            element={
              <ProtectedRoute roles={[UserRole.Admin, UserRole.Manager]}>
                <TimeoffsManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeoffs/teams/:teamId"
            element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={[UserRole.Admin, UserRole.Bookkeeper]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoice-management"
            element={
              <ProtectedRoute roles={[UserRole.Admin, UserRole.Bookkeeper]}>
                <InvoiceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={[UserRole.Admin, UserRole.Bookkeeper]}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
