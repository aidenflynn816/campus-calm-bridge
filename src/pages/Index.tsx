
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Clock, MessageCircle, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (user) {
      navigate(user.role === 'student' ? '/student' : user.role === 'counselor' ? '/counselor/mood-insights' : '/student');
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <img 
              src="/lovable-uploads/c07e7cef-cb7e-48d7-a0eb-c68a0c5f5175.png" 
              alt="Groton School Crest" 
              className="w-24 h-24"
            />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-primary mb-4"
          >
            Groton Counseling Center
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-foreground/80 max-w-2xl mb-8"
          >
            Supporting Groton students' mental health and wellness journey
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Link to="/register">
              <Button 
                className="groton-button-primary text-lg px-8 py-6 group"
              >
                Get Started
                <ArrowRight className={`ml-2 transition-transform duration-300 ${isHovered ? "transform translate-x-1" : ""}`} />
              </Button>
            </Link>
            
            <Link to="/login">
              <Button
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/5 text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
        
        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-muted/30 hover:shadow-medium transition-shadow">
            <div className="w-12 h-12 bg-accent/30 rounded-2xl flex items-center justify-center mb-4">
              <Clock className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">Flexible Scheduling</h3>
            <p className="text-foreground/70">Book counseling appointments around your academic schedule</p>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-muted/30 hover:shadow-medium transition-shadow">
            <div className="w-12 h-12 bg-accent/30 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">Confidential Support</h3>
            <p className="text-foreground/70">Private, secure communication with your counselor</p>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-muted/30 hover:shadow-medium transition-shadow">
            <div className="w-12 h-12 bg-accent/30 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">Student Resources</h3>
            <p className="text-foreground/70">Tailored wellness resources for boarding school life</p>
          </div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="py-8 text-center text-foreground/50 text-sm"
      >
        <p>&copy; {new Date().getFullYear()} Groton Counseling Center | Supporting Student Wellness</p>
      </motion.footer>
    </div>
  );
};

export default Index;
