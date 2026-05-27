
import './App.css'
import {
    BrowserRouter as Router,
    Routes,
    Route
} from "react-router-dom"
import Landing from "./pages/authPage/landing.tsx";
import Login from "./pages/authPage/login.tsx";
import Register from "./pages/authPage/register.tsx";
import ConfirmAccount from "./pages/authPage/confirmAccount.tsx";
import ResetPassword from "./pages/authPage/resetPassword.tsx";
import CompleteProfile from "./pages/authPage/completeProfile.tsx";
import Home from "./pages/appPage/Home.tsx";
import AppLayout from "./layout/AppLayout.tsx";
import { ScrollToTop } from "./components/common/ScrollToTop.tsx";
import RequireAuth from "./context/RequireAuth.tsx";
import AdminGuard from "./context/AdminGuard.tsx";
import MyCourse from "./pages/appPage/Course.tsx";
import SummaryList from "./pages/appPage/SummaryList.tsx";
import Summary from "./pages/appPage/Summary.tsx";
import Exams from "./pages/appPage/Exams.tsx";
import Chat from "./pages/appPage/Chat.tsx";
import Settings from "./pages/appPage/Settings.tsx";
import About from "./pages/authPage/about.tsx";
import SettingsProfile from "./pages/appPage/SettingsProfile.tsx";
import SettingsSubscription from "./pages/appPage/SettingsSubscription.tsx";
import SettingsAnnouncements from "./pages/appPage/SettingsAnnouncements.tsx";
import SettingsFeedback from "./pages/appPage/SettingsFeedback.tsx";
import Statistics from "./pages/appPage/Statistics.tsx";
import AdminHome from "./pages/admin/AdminHome.tsx";
import AdminLayout from "./layout/admin/AdminLayout.tsx";
import Users from "./pages/admin/Users.tsx";
import Subscriptions from "./pages/admin/Subscriptions.tsx";
import Plans from "./pages/admin/Plans.tsx";
import Payments from "./pages/admin/Payments.tsx";
import Announcements from "./pages/admin/Announcements.tsx";
import Feedbacks from "./pages/admin/Feedbacks.tsx";
import Reports from "./pages/admin/Reports.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";
import ExamLibrary from "./pages/appPage/ExamLibrary.tsx";
import UserProfiles from "./pages/appPage/UserProfiles.tsx";
import PaymentListPage from './pages/appPage/PaymentListPage.tsx';
import PaymentSuccess from './pages/appPage/PaymentSuccess.tsx';
import PaymentCancel from './pages/appPage/PaymentCancel.tsx';
import Workspaces from './pages/appPage/Workspaces.tsx';
import WorkspaceNotebook from './pages/appPage/WorkspaceNotebook.tsx';

function App() {

    return (
        <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/confirm" element={<ConfirmAccount />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/about" element={<About />} />

                <Route element={<RequireAuth />}>
                    <Route path="/complete-profile" element={<CompleteProfile />} />
                    <Route element={<AppLayout />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/workspaces" element={<Workspaces />} />
                        <Route path="/workspaces/notebook/:notebookId" element={<WorkspaceNotebook />} />
                        <Route path="/my-summaries" element={<SummaryList />} />
                        <Route path="/my-summaries/summary" element={<Summary />} />
                        <Route path="/my-courses" element={<MyCourse />} />
                        <Route path="/my-courses/:courseId/:courseName/summaries" element={<SummaryList />} />
                        <Route path="/my-courses/:courseId/:courseName/summaries/:summaryId" element={<Summary />} />
                        <Route path="/library-summary" element={<Home />} />
                        <Route path="/exams" element={<Exams />} />
                        <Route path="/exam-library" element={<ExamLibrary />} />
                        <Route path="/statistics" element={<Statistics />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/profile" element={<UserProfiles />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/settings/profile" element={<SettingsProfile />} />
                        <Route path="/settings/subscription" element={<SettingsSubscription />} />
                        <Route path="/settings/payments" element={<PaymentListPage />} />
                        <Route path="/settings/announcements" element={<SettingsAnnouncements />} />
                        <Route path="/settings/feedback" element={<SettingsFeedback />} />
                        <Route path="/payment/success" element={<PaymentSuccess />} />
                        <Route path="/payment/cancel" element={<PaymentCancel />} />
                    </Route>
                    <Route element={<AdminGuard />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/admin/home" element={<AdminHome />} />
                            <Route path="/admin/users" element={<Users />} />
                            <Route path="/admin/subscriptions" element={<Subscriptions />} />
                            <Route path="/admin/plans" element={<Plans />} />
                            <Route path="/admin/payments" element={<Payments />} />
                            <Route path="/admin/announcements" element={<Announcements />} />
                            <Route path="/admin/feedbacks" element={<Feedbacks />} />
                            <Route path="/admin/reports" element={<Reports />} />
                            <Route path="/admin/settings" element={<AdminSettings />} />
                        </Route>
                    </Route>
                </Route>

            </Routes>
        </Router>
    )
}

export default App


