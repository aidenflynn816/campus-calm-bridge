
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bridge-background">
      <img 
        src="/lovable-uploads/c07e7cef-cb7e-48d7-a0eb-c68a0c5f5175.png" 
        alt="Groton School Crest" 
        className="w-24 h-24 mb-4"
      />
      <h1 className="text-xl font-medium text-bridge-primary mb-4">Groton Counseling Center</h1>
      <Loader2 className="h-8 w-8 animate-spin text-bridge-primary" />
    </div>
  );
};

export default LoadingScreen;
