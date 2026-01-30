import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import OtpAndResetPassword from "./pages/OtpAndResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NewBluebook from "./pages/NewBluebook.jsx";
import BluebookDetail from "./pages/BluebookDetail.jsx";
import Profile from "./pages/Profile.jsx";
import Payment from "./pages/Payment.jsx";
import ElectricPayment from "./pages/ElectricPayment.jsx";
import PaymentVerification from "./pages/PaymentVerification.jsx";
import ElectricPaymentVerification from "./pages/ElectricPaymentVerification.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import ResetPassword from "./pages/ResetPassword.jsx";
import ElectricNewBluebook from "./pages/ElectricNewBluebook.jsx";
import ElectricBluebookDetail from "./pages/ElectricBluebookDetail.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  return (
    <>
      <ToastContainer
        theme="colored"
        autoClose={1000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick={true}
      />
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/otp-verification"
                element={<OtpAndResetPassword />}
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/bluebook/new" element={<NewBluebook />} />
              <Route path="/electric-bluebook/new" element={<ElectricNewBluebook />} />
              <Route path="/electric-bluebook/:id" element={<ElectricBluebookDetail />} />
              <Route path="/bluebook/:id" element={<BluebookDetail />} />
              <Route path="/electric-bluebook/:id" element={<ElectricBluebookDetail />} />
              <Route path="/payment/:id" element={<Payment />} />
              <Route path="/electric-payment/:id" element={<ElectricPayment />} />
              <Route
                path="/payment-verification/:id"
                element={<PaymentVerification />}
              />
              <Route
                path="/electric-payment-verification/:id"
                element={<ElectricPaymentVerification />}
              />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </>
  );
}

export default App;
