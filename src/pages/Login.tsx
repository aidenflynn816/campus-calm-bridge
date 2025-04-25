
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, MessageSquare, BookOpen } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
    } catch (error) {
      // Error is handled in signIn function
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bridge-background">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-16 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <img 
              src="/lovable-uploads/ca0b6e19-c587-4ef5-9c6e-a46c2594cffc.png" 
              alt="Bridge Logo" 
              className="w-12 h-12"
            />
            <h1 className="text-2xl font-medium text-bridge-primary">Bridge</h1>
          </div>
          
          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-gray-600 mb-8">Sign in to continue to Bridge</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bridge-input"
                placeholder="you@school.edu"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <a href="#" className="text-sm text-bridge-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bridge-input"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </div>
            
            <Button
              type="submit"
              className="bridge-button-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-bridge-primary hover:underline">
              Sign up
            </Link>
          </p>
          
          <div className="mt-10 text-sm text-gray-500">
            <p className="mb-2">Demo accounts (for testing):</p>
            <p>Student: student@example.com / password</p>
            <p>Counselor: counselor@example.com / password</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Image/Info */}
      <div className="hidden md:block md:w-1/2 bg-bridge-primary p-10 flex items-center justify-center">
        <div className="max-w-md text-white">
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4">Mental Wellness Support for Students</h2>
            <p className="mb-6">
              Bridge connects students with counselors to provide mental health support, resources, and a safe space to discuss your wellbeing.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Calendar size={20} className="text-white" />
                </div>
                <span>Book sessions with counselors</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare size={20} className="text-white" />
                </div>
                <span>Secure messaging with your support team</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen size={20} className="text-white" />
                </div>
                <span>Access wellness resources and guides</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
