import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, PiggyBank } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-purple-gradient rounded-xl flex items-center justify-center">
              <PiggyBank className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-8xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
          <p className="text-foreground/70 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <Link to="/">
            <Button className="bg-purple-gradient text-white w-full">
              <Home className="h-4 w-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button
              variant="outline"
              className="glass border-purple-500/50 text-purple-400 hover:bg-purple-500/10 w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
