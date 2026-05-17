
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, MessageSquare, BookOpen, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const role = "student" as const;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@groton.org")) {
      toast.error("Student accounts must use a @groton.org email address");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signUp(normalizedEmail, password, role, name);
    } catch (error) {
      // Error is handled in signUp function
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
          
          <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-2">Create Account</motion.h2>
          <motion.p variants={itemVariants} className="text-gray-600 mb-8">Join Bridge for mental wellness support</motion.p>
          
          <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bridge-input"
                placeholder="Your full name"
                disabled={isSubmitting}
              />
            </motion.div>
            
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
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
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
            
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bridge-input"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-3">
              <p className="block text-sm font-medium">I am a:</p>
              <RadioGroup 
                value={role} 
                onValueChange={(value) => setRole(value as "student" | "counselor")}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2 bg-white rounded-xl p-3 px-4 border border-bridge-muted/50 cursor-pointer hover:border-bridge-primary/30 transition-colors">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="cursor-pointer font-medium">Student</Label>
                </div>
                <div className="flex items-center space-x-2 bg-white rounded-xl p-3 px-4 border border-bridge-muted/50 cursor-pointer hover:border-bridge-primary/30 transition-colors">
                  <RadioGroupItem value="counselor" id="counselor" />
                  <Label htmlFor="counselor" className="cursor-pointer font-medium">Counselor/Staff</Label>
                </div>
              </RadioGroup>
            </motion.div>
            
            <motion.div variants={itemVariants} className="pt-2">
              <Button
                type="submit"
                className="bridge-button-primary w-full flex items-center justify-center gap-2 mt-6"
                disabled={isSubmitting}
              >
                <UserPlus size={18} />
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </motion.div>
            
          </motion.form>
          
          <motion.p variants={itemVariants} className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-bridge-primary hover:underline">
              Sign in
            </Link>
          </motion.p>
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
            <h2 className="text-2xl font-bold mb-4">Join our Wellness Community</h2>
            <p className="mb-6">
              Bridge provides a safe space for students to connect with counselors and access mental health resources.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Calendar size={20} className="text-white" />
                </div>
                <span>Schedule sessions that fit your schedule</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageSquare size={20} className="text-white" />
                </div>
                <span>Private and secure communication</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen size={20} className="text-white" />
                </div>
                <span>Access wellness resources anytime</span>
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

export default Register;
