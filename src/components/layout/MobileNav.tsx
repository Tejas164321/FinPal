import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Menu,
  X,
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

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full z-50 glass-card border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-gradient rounded-lg flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              FinPal
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 h-full w-64 z-50 glass-card border-r border-white/10"
          >
            <div className="p-6 pt-20">
              <nav className="space-y-2">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                    >
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
                <Link to="/settings" onClick={() => setIsOpen(false)}>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav;
