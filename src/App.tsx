import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import Payroll from "./pages/Payroll";
import Exams from "./pages/Exams";
import ExamResults from "./pages/ExamResults";
import MarksheetGenerator from "./pages/MarksheetGenerator";
import Homework from "./pages/Homework";
import FeeManagement from "./pages/FeeManagement";
import Library from "./pages/Library";
import TransportPage from "./pages/TransportPage";
import InventoryPage from "./pages/InventoryPage";
import DocumentsPage from "./pages/DocumentsPage";
import Announcements from "./pages/Announcements";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import AiAssistant from "./pages/AiAssistant";
import NotFound from "./pages/NotFound";
import TCGenerator from "./pages/TCGenerator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Dashboard routes */}
            <Route element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/payroll" element={<Payroll />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/exams/:examId/results" element={<ExamResults />} />
              <Route path="/marksheet" element={<MarksheetGenerator />} />
              <Route path="/homework" element={<Homework />} />
              <Route path="/fees" element={<FeeManagement />} />
              <Route path="/library" element={<Library />} />
              <Route path="/transport" element={<TransportPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/ai-assistant" element={<AiAssistant />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
