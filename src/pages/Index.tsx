import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Smartphone,
  Brain,
  Shield,
  TrendingUp,
  Zap,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  PiggyBank,
  CreditCard,
  BarChart3,
  Bot,
  Upload,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "UPI Transaction Analysis",
    description:
      "Smart parsing of GPay, PhonePe, and bank UPI statements with automatic categorization",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Get personalized spending insights and budget recommendations powered by Gemini AI",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Bank-grade security with end-to-end encryption. Your financial data stays safe",
  },
  {
    icon: TrendingUp,
    title: "Investment Simulator",
    description:
      "Calculate SIP returns and compare investment options with real-time projections",
  },
  {
    icon: Zap,
    title: "Real-time Budgeting",
    description:
      "Set smart budgets and get instant alerts when you're about to overspend",
  },
  {
    icon: Bot,
    title: "AI Chat Assistant",
    description:
      "Ask questions about your spending in natural language and get instant answers",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer, Bangalore",
    content:
      "FinPal helped me track my UPI expenses effortlessly. The AI insights are spot on!",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Business Analyst, Mumbai",
    content:
      "Amazing investment simulator. Helped me plan my SIPs better than any other app.",
    rating: 5,
  },
  {
    name: "Anjali Patel",
    role: "Marketing Manager, Delhi",
    content:
      "The budget alerts saved me from overspending multiple times. Highly recommended!",
    rating: 5,
  },
];

const benefits = [
  "Automatic transaction categorization with 95% accuracy",
  "Real-time spending alerts and budget tracking",
  "Detailed financial reports and export options",
  "Investment planning with SIP calculators",
  "AI-powered spending pattern analysis",
  "Secure data handling with bank-grade encryption",
];

const Index = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-0 border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-purple-gradient rounded-lg flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                FinPal
              </span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-foreground/80 hover:text-purple-400 transition-colors"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-foreground/80 hover:text-purple-400 transition-colors"
              >
                Benefits
              </a>
              <a
                href="#testimonials"
                className="text-foreground/80 hover:text-purple-400 transition-colors"
              >
                Reviews
              </a>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  className="glass border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  Login
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button className="bg-purple-gradient text-white hover:scale-105 transition-transform">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 glass-strong text-purple-400 border-purple-500/50">
              🚀 AI-Powered Finance Management
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Master Your{" "}
              <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                UPI Spending
              </span>
              <br />
              with AI Intelligence
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto">
              Upload your UPI transaction history and let our AI analyze your
              spending patterns, create smart budgets, and provide personalized
              financial insights tailored for Indian users.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="bg-purple-gradient text-white hover:scale-105 transition-transform px-8 py-4 text-lg"
                >
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/upload">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass border-purple-500/50 text-purple-400 hover:bg-purple-500/10 px-8 py-4 text-lg"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Transactions
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Floating Cards Animation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                className="glass-card p-6 animate-float"
                style={{ animationDelay: "0s" }}
              >
                <CreditCard className="h-12 w-12 text-purple-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">
                  Smart Categorization
                </h3>
                <p className="text-foreground/70">
                  AI categorizes your UPI transactions automatically
                </p>
              </motion.div>

              <motion.div
                className="glass-card p-6 animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                <BarChart3 className="h-12 w-12 text-purple-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Visual Analytics</h3>
                <p className="text-foreground/70">
                  Beautiful charts and insights at your fingertips
                </p>
              </motion.div>

              <motion.div
                className="glass-card p-6 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <Target className="h-12 w-12 text-purple-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Budget Goals</h3>
                <p className="text-foreground/70">
                  Set and track budgets with real-time alerts
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Smart Finance
              </span>
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Everything you need to take control of your UPI spending and build
              better financial habits
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card h-full hover:glow-purple transition-all duration-300 group">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                    <CardTitle className="text-xl group-hover:text-purple-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/70">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-20 px-6 bg-gradient-to-r from-purple-900/20 to-purple-800/20"
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Why Choose
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  FinPal?
                </span>
              </h2>
              <p className="text-xl text-foreground/80 mb-8">
                Join thousands of users who have transformed their financial
                habits with FinPal's intelligent insights
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-6 w-6 text-purple-400 flex-shrink-0" />
                    <span className="text-foreground/90">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-purple-gradient opacity-10"></div>
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-purple-400 mb-2">
                      ₹2.5L+
                    </div>
                    <div className="text-foreground/80">
                      Average savings identified per user
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        95%
                      </div>
                      <div className="text-sm text-foreground/70">
                        Accuracy Rate
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        10k+
                      </div>
                      <div className="text-sm text-foreground/70">
                        Happy Users
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        4.8★
                      </div>
                      <div className="text-sm text-foreground/70">
                        User Rating
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        24/7
                      </div>
                      <div className="text-sm text-foreground/70">
                        AI Support
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              What Our Users
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Are Saying
              </span>
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="glass-card h-full">
                    <CardContent className="p-6">
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-5 w-5 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                      <p className="text-foreground/80 mb-4 italic">
                        "{testimonial.content}"
                      </p>
                      <div>
                        <div className="font-semibold text-purple-400">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-foreground/60">
                          {testimonial.role}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass-card p-12 max-w-4xl mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-purple-gradient opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Transform Your
                <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Financial Life?
                </span>
              </h2>
              <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
                Join thousands of Indians who are already making smarter
                financial decisions with FinPal's AI-powered insights
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="bg-purple-gradient text-white hover:scale-105 transition-transform px-8 py-4 text-lg"
                  >
                    Start Your Free Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/upload">
                  <Button
                    size="lg"
                    variant="outline"
                    className="glass border-purple-500/50 text-purple-400 hover:bg-purple-500/10 px-8 py-4 text-lg"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Try Upload Demo
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-purple-gradient rounded-lg flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                FinPal
              </span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-foreground/60 mb-2">
                © 2024 FinPal. All rights reserved.
              </p>
              <p className="text-sm text-foreground/40">
                Made with ❤️ for Indian UPI users
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
