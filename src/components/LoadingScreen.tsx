
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bridge-background">
      <img 
        src="/lovable-uploads/ca0b6e19-c587-4ef5-9c6e-a46c2594cffc.png" 
        alt="Bridge Logo" 
        className="w-24 h-24 mb-4"
      />
      <h1 className="text-2xl font-medium text-bridge-primary mb-4">Bridge</h1>
      <Loader2 className="h-8 w-8 animate-spin text-bridge-primary" />
    </div>
  );
};

export default LoadingScreen;
