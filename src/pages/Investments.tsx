import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calculator, PieChart } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

const Investments = () => {
  return (
    <div className="min-h-screen bg-dark-gradient">
      <Sidebar />
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Investment Simulator</h1>
          <p className="text-foreground/70">
            Calculate SIP returns and compare investment options
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-purple-400" />
                SIP Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Calculator className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <p className="text-foreground/60 mb-4">
                Calculate returns on your systematic investment plans
              </p>
              <Button className="bg-purple-gradient">Start Calculation</Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
                FD Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <p className="text-foreground/60 mb-4">
                Compare fixed deposit returns with other investments
              </p>
              <Button variant="outline" className="glass border-purple-500/50">
                Calculate FD
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-purple-400" />
                Portfolio Compare
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <PieChart className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <p className="text-foreground/60 mb-4">
                Compare multiple investment plans side by side
              </p>
              <Button variant="outline" className="glass border-purple-500/50">
                Compare Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Investments;