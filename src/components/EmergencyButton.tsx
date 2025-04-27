
import { Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";

export function EmergencyButton() {
  const { user } = useAuth();
  const [emergencyContact, setEmergencyContact] = useState(user?.emergency_contact || "");
  const counselingOfficeNumber = "1-800-123-4567"; // This should come from env or database
  
  const handleEmergencyCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleUrgentMessage = () => {
    // This will be implemented when we add the messaging feature
    console.log("Sending urgent message");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-[#E5DEFF] hover:bg-[#D1C5FF] text-bridge-primary shadow-md"
          >
            <Shield className="h-6 w-6" />
            <span className="sr-only">Emergency Help</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">Emergency Help</DialogTitle>
            <DialogDescription className="text-center">
              Choose how you'd like to receive assistance
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full py-6 text-lg"
                  variant="secondary"
                >
                  Call for Immediate Help
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will initiate a call to the counseling office emergency number.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleEmergencyCall(counselingOfficeNumber)}
                  >
                    Yes, Call Now
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {emergencyContact && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full py-6 text-lg"
                    variant="secondary"
                  >
                    Call Personal Emergency Contact
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Call Personal Contact?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will call your emergency contact number.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleEmergencyCall(emergencyContact)}
                    >
                      Yes, Call Now
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button
              className="w-full py-6 text-lg"
              variant="outline"
              onClick={handleUrgentMessage}
            >
              Send Urgent Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
