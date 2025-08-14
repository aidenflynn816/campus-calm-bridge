
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, MessageSquare, BookOpen, LogIn } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bridge-background">
      {/* Left side - Form */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full md:w-1/2 p-6 md:p-10 lg:p-16 flex flex-col justify-center"
      >
        <div className="max-w-md w-full mx-auto">
          <motion.div variants={itemVariants} className="flex items-center space-x-3 mb-8">
            <img 
              src="/lovable-uploads/ca0b6e19-c587-4ef5-9c6e-a46c2594cffc.png" 
              alt="Bridge Logo" 
              className="w-12 h-12"
            />
            <h1 className="text-2xl font-medium text-bridge-primary">Bridge</h1>
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-2">Welcome back</motion.h2>
          <motion.p variants={itemVariants} className="text-gray-600 mb-8">Sign in to continue to Bridge</motion.p>
          
          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
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
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-2">
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
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="bridge-button-primary w-full flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <LogIn size={18} />
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-bridge-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-bridge-muted/50 hover:border-bridge-primary/30"
                onClick={async () => {
                  try {
                    await signInWithGoogle();
                  } catch (error) {
                    // Error is handled in signInWithGoogle function
                  }
                }}
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </motion.div>
          </motion.form>
          
          <motion.p variants={itemVariants} className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-bridge-primary hover:underline">
              Sign up
            </Link>
          </motion.p>
          
          <motion.div variants={itemVariants} className="mt-10 text-sm text-gray-500 p-4 bg-gray-50 rounded-xl">
            <p className="font-medium mb-2">Demo accounts (for testing):</p>
            <p className="flex items-center mb-1">
              <span className="w-16 inline-block">Student:</span> 
              <code className="bg-gray-100 px-2 py-1 rounded">student@example.com / password</code>
            </p>
            <p className="flex items-center">
              <span className="w-16 inline-block">Counselor:</span> 
              <code className="bg-gray-100 px-2 py-1 rounded">counselor@example.com / password</code>
            </p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Right side - Image/Info */}
      <div className="hidden md:block md:w-1/2 bg-bridge-primary p-10 flex items-center justify-center overflow-hidden relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-md text-white relative z-10"
        >
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur border border-white/10 shadow-lg">
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
        </motion.div>
        
        {/* Abstract shapes for background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
