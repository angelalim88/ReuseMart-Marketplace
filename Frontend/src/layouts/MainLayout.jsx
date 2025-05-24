import React, { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import Header from "../components/navigation/HeaderUtama";
import Footer from "../components/navigation/Footer";
import TopNavigation from "../components/navigation/TopNavigation";
import { decodeToken } from "../utils/jwtUtils";
import { SearchProvider } from "../utils/searchContext";

const MainLayout = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    
    if (token) {
      const decoded = decodeToken(token);
      console.log(decoded);
      setUserRole(decoded.role);
    }
  }, []);

  return (
    <SearchProvider>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        <TopNavigation userRole={userRole} />  
        <main className="flex-grow-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </SearchProvider>
  );
};

export default MainLayout;