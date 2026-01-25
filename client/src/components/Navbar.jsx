// import React from "react";
// import { assets } from "../assets/assets";
// import { useNavigate } from "react-router-dom";
// import { ArrowRight } from "lucide-react";
// import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

// const Navbar = () => {
//   const navigate = useNavigate();
//   const { user } = useUser();
//   const { openSignIn } = useClerk();
//   return (
//     <div className="fixed z-5 w-full backdrop-blur-2xl flex items-center justify-between py-3 px-4 sm:px-20 xl:px-32">
//       <img
//         src={assets.logo}
//         alt="logo"
//         className="w-32 sm:w-44 cursor-pointer"
//         onClick={() => navigate("/")}
//       />
//       {user ? (
//         <UserButton />
//       ) : (
//         <button onClick={openSignIn} className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5">
//           Get Started <ArrowRight className="w-4 h-4" />
//         </button>
//       )}
//     </div>
//   );
// };

// export default Navbar;


import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isPremium, logout } = useAuth();
  
        console.log("VITE_API_URL =", import.meta.env.VITE_API_URL)

  return (
    <div className="fixed z-50 w-full backdrop-blur-2xl flex items-center justify-between py-3 px-4 sm:px-20 xl:px-32">
      <img
        src={assets.logo}
        alt="logo"
        className="w-32 sm:w-44 cursor-pointer"
        onClick={() => navigate("/")}
      />
  
      {!isAuthenticated ? (
        <button
          onClick={() => (window.location.href = "http://localhost:3000/api/user/google")}
          className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {isPremium ? "Premium" : "Free"} Plan
          </span>
          <LogOut
            onClick={logout}
            className="w-5 cursor-pointer text-gray-500 hover:text-black"
          />
        </div>
      )}
    </div>
  );
};

export default Navbar;
