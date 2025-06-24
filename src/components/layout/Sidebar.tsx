import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart,
  Wallet,
  Target,
  Brain,
  Upload,
  TrendingUp,
  Download,
  PiggyBank,
  User,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: BarChart, label: "Dashboard", path: "/dashboard" },
  { icon: Wallet, label: "Transactions", path: "/transactions" },
  { icon: Target, label: "Budgets", path: "/budgets" },
  { icon: Brain, label: "AI Insights", path: "/ai-insights" },
  { icon: Upload, label: "Upload Data", path: "/upload" },
  { icon: TrendingUp, label: "Investments", path: "/investments" },
  { icon: Download, label: "Reports", path: "/reports" },
  { icon: User, label: "Profile", path: "/profile" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="fixed left-0 top-0 h-full w-64 glass-card border-r border-white/10 z-40">
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-purple-gradient rounded-lg flex items-center justify-center">
            <PiggyBank className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            FinPal
          </span>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={index} to={item.path}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    isActive
                      ? "bg-purple-gradient text-white"
                      : "text-foreground/70 hover:bg-white/5 hover:text-purple-400"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </motion.button>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-white/10">
          <Link to="/settings">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all text-foreground/70 hover:bg-white/5 hover:text-purple-400"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
