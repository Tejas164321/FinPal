import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Filter, Search, Download } from "lucide-react";

const Transactions = () => {
  return (
    <div className="min-h-screen bg-dark-gradient p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-foreground/70">
            View and manage all your UPI transaction history
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Transaction Management
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="glass border-purple-500/50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button
                  variant="outline"
                  className="glass border-purple-500/50"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button className="bg-purple-gradient">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CSV/PDF
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <Upload className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-foreground/60 mb-6 max-w-md mx-auto">
              Upload your UPI transaction history from GPay, PhonePe, or bank
              statements to get started with AI-powered analysis.
            </p>
            <Button className="bg-purple-gradient">
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First File
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;
