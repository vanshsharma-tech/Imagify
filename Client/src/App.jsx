import { useContext, useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import BuyCredit from "./pages/BuyCredit";
import Results from "./pages/Results";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import { AppContext } from "./context/AppContext";
import { ToastContainer, toast } from "react-toastify";

function App() {
  const { showLogin } = useContext(AppContext);
  return (
    <>
      <div className="px-4 sm:px-10 md:px-14 lg:px-28 min-h-screen bg-gradient-to-b from-teal-50 to-orange-50">
        <ToastContainer position="bottom-right" />
        <NavBar />
        {showLogin && <Login />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buy" element={<BuyCredit />} />
          <Route path="/result" element={<Results />} />
        </Routes>
        <Footer />
      </div>
    </>
  );
}

export default App;
