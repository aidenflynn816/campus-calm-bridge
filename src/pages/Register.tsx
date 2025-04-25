
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "counselor">("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signUp(email, password, role, name);
    } catch (error) {
      // Error is handled in signUp function
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
          
          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p className="text-gray-600 mb-8">Join Bridge for mental wellness support</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
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
            </div>
            
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
            </div>
            
            <div className="space-y-2">
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
            </div>
            
            <div className="space-y-2">
              <p className="block text-sm font-medium mb-2">I am a:</p>
              <RadioGroup 
                value={role} 
                onValueChange={(value) => setRole(value as "student" | "counselor")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="counselor" id="counselor" />
                  <Label htmlFor="counselor">Counselor/Staff</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button
              type="submit"
              className="bridge-button-primary w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-bridge-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right side - Image/Info */}
      <div className="hidden md:block md:w-1/2 bg-bridge-primary p-10 flex items-center justify-center">
        <div className="max-w-md text-white">
          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur">
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
        </div>
      </div>
    </div>
  );
};

export default Register;
