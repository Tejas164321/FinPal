import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, AlertTriangle } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

const Budgets = () => {
  return (
    <div className="min-h-screen bg-dark-gradient">
      <Sidebar />
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Budget Management</h1>
            <p className="text-foreground/70">
              Set spending limits and track your budget goals
            </p>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Your Budgets
                <Button className="bg-purple-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Target className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Budgets Set</h3>
              <p className="text-foreground/60 mb-6 max-w-md mx-auto">
                Create your first budget to start tracking spending limits and
                receive alerts when you exceed them.
              </p>
              <Button className="bg-purple-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
