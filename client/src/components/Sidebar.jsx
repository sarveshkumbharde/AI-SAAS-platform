import React from "react";
import {
  Eraser,
  FileText,
  Hash,
  House,
  Scissors,
  SquarePen,
  User,
  Image,
  LogOut,
  Brain
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Plan from "../pages/Plan";

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: House },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
  { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: User },
  { to: "/ai/plan", label: "Plan", Icon: Brain}
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { isPremium, logout } = useAuth();

  return (
    <div className="w-60 bg-white border-r flex flex-col justify-between">
      <div className="px-6 mt-8 text-sm font-medium">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} onClick={() => setSidebar(false)}>
            <div className="flex items-center gap-3 py-2">
              <Icon className="w-4 h-4" />
              {label}
            </div>
          </NavLink>
        ))}
      </div>

      <div className="border-t p-4 flex justify-between items-center">
        <span className="text-sm">
          {isPremium ? "Premium Plan" : "Free Plan"}
        </span>
        <LogOut
          onClick={logout}
          className="w-4 cursor-pointer text-gray-400 hover:text-black"
        />
      </div>
    </div>
  );
};

export default Sidebar;
