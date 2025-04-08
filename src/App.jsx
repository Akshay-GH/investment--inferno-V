

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import StarBackground from "./components/StarBackground";
import Signin from "./Pages/Signin";
import Signup from "./Pages/Signup";
import Landing from "./Pages/Landing";
import Stocklist from "./Pages/Stocklist";
import StockChart from "./Pages/StockChart";
import Portfolio from "./Pages/Portfolio";
import Dashboard from "./Pages/Dashboard";
import OrderHistory from "./Pages/OrderHistory";
import Leaderboard from "./Pages/Leaderboard";



function App() {
  const location = useLocation(); // Get the current route

  // Hide Navbar for Signin and Signup pages
  const hideNavbar = location.pathname === "/" || location.pathname === "/signin";
  // async function getCsrfToken() {
  //   // Check if CSRF token is already stored
  //   let csrfToken = localStorage.getItem("csrfToken");
    
  //   console.log("fetching", csrfToken)
  //   if (!csrfToken) {
  //     // If not available, fetch it from the backend
  //     const response = await fetch("http://127.0.0.1:8000/get_csrf/", {
  //       credentials: "include",
  //     });
  //     console.log(response)
  //     if (response.ok) {
  //       const data = await response.json();
  //       csrfToken = data.csrfToken;
  //       // Store CSRF token in localStorage for future use
  //       localStorage.setItem("csrfToken", csrfToken);
  //     } else {
  //       console.error("Failed to fetch CSRF token");
  //       return null;
  //     }
  //   }

  //   return csrfToken;
  // }


  return (
    <>
      {!hideNavbar && <Navbar />}
      <StarBackground />
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/" element={<Signup />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/stocklist" element={<Stocklist />} />
        <Route path="/stockchart/:ticker" element={<StockChart />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/orderhistory" element={<OrderHistory />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
       


        
      </Routes>
    </>
  );
}

// Wrap App in BrowserRouter in index.js or main.jsx
export default function WrappedApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

