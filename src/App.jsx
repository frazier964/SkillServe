import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Postjob from "./pages/Postjob";
import ViewJobs from "./pages/ViewJobs";
import Handymen from "./pages/handymen";
import StudentDetails from "./pages/Studentdetails";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Premium from "./pages/Premium";
import Profile from "./pages/Profile";
import ProfileView from "./pages/ProfileView";
import Payment from "./pages/Payment";
import Creators from "./pages/Creators";
import Jobs from "./pages/Jobs";
import JobApply from "./pages/JobApply";
import Cashout from "./pages/Cashout";
import Analytics from "./pages/Analytics";
import ClientRatings from "./pages/ClientRatings";
import Availability from "./pages/Availability";
import Help from "./pages/Help";
import OrderFood from "./pages/OrderFood";
import FoodPayment from "./pages/FoodPayment";
import OrderConfirmation from "./pages/OrderConfirmation";
import Activities from "./pages/Activities";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  

  return (
    <Router>
      <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
          <Route path="/postjob" element={<ProtectedRoute><Postjob /></ProtectedRoute>} />
        <Route path="/viewjobs" element={<ProtectedRoute><ViewJobs /></ProtectedRoute>} />
        <Route path="/handymen" element={<Handymen />} />
        <Route path="/studentdetails" element={<StudentDetails />} />
        
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
        <Route path="/premium/checkout" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/view" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
        <Route path="/creators" element={<ProtectedRoute><Creators /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/jobs/:index" element={<ProtectedRoute><JobApply /></ProtectedRoute>} />
        <Route path="/cashout" element={<ProtectedRoute><Cashout /></ProtectedRoute>} />
        <Route path="/clientratings" element={<ProtectedRoute><ClientRatings /></ProtectedRoute>} />
        <Route path="/availability" element={<ProtectedRoute><Availability /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
        <Route path="/order-food" element={<ProtectedRoute><OrderFood /></ProtectedRoute>} />
        <Route path="/food-payment" element={<ProtectedRoute><FoodPayment /></ProtectedRoute>} />
        <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
        <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
