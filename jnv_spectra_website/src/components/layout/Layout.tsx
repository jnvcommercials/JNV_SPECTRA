import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
// import HeroHeader from "./HeroHeader"; // This is the homepage header
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Use HeroHeader on the homepage, otherwise use the standard Header */}
      {location.pathname === "/" ? null : <Header />}
      
      <main className="flex-grow  ">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
