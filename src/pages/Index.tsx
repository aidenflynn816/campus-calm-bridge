
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Clock, MessageCircle, BookOpen } from "lucide-react";

const Index = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-bridge-background to-bridge-secondary/20">
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
              src="/lovable-uploads/ca0b6e19-c587-4ef5-9c6e-a46c2594cffc.png" 
              alt="Bridge Logo" 
              className="w-20 h-20"
            />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-bridge-primary mb-4"
          >
            Welcome to Bridge
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-bridge-text/80 max-w-2xl mb-8"
          >
            Your connection to mental wellness support and resources
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Button 
              asChild 
              className="bridge-button-primary text-lg px-8 py-6 group"
            >
              <Link to="/login">
                Sign In
                <ArrowRight className={`ml-2 transition-transform duration-300 ${isHovered ? "transform translate-x-1" : ""}`} />
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="border-bridge-primary/30 text-bridge-primary hover:bg-bridge-primary/5 text-lg px-8 py-6"
            >
              <Link to="/register">Create Account</Link>
            </Button>
          </motion.div>
        </div>
        
        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-bridge-muted/30 hover:shadow-medium transition-shadow">
            <div className="w-12 h-12 bg-bridge-accent/30 rounded-2xl flex items-center justify-center mb-4">
              <Clock className="text-bridge-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-bridge-primary mb-2">Easy Scheduling</h3>
            <p className="text-bridge-text/70">Book appointments with counselors that fit your schedule</p>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-bridge-muted/30 hover:shadow-medium transition-shadow">
            <div className="w-12 h-12 bg-bridge-accent/30 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="text-bridge-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-bridge-primary mb-2">Secure Messaging</h3>
            <p className="text-bridge-text/70">Private communication with your support team</p>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-bridge-muted/30 hover:shadow-medium transition-shadow">
            <div className="w-12 h-12 bg-bridge-accent/30 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="text-bridge-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-bridge-primary mb-2">Wellness Resources</h3>
            <p className="text-bridge-text/70">Access helpful materials for your mental wellbeing</p>
          </div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="py-8 text-center text-bridge-text/50 text-sm"
      >
        <p>&copy; {new Date().getFullYear()} Bridge | Mental Health Support Platform</p>
      </motion.footer>
    </div>
  );
};

export default Index;
