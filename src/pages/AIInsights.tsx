import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, MessageSquare, TrendingUp } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const AIInsights = () => {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Insights</h1>
          <p className="text-foreground/70">
            Get personalized financial insights powered by Gemini AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-400" />
                Spending Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <p className="text-foreground/60 mb-4">
                Upload transaction data to get AI-powered spending insights
              </p>
              <Button variant="outline" className="glass border-purple-500/50">
                Generate Analysis
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-purple-400" />
                AI Chat Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <p className="text-foreground/60 mb-4">
                Ask questions about your spending in natural language
              </p>
              <Button variant="outline" className="glass border-purple-500/50">
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AIInsights;
