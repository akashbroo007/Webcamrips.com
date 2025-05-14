"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="flex flex-col items-center">
          <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-center text-gray-600">
            You don't have permission to access this page. This area requires higher privileges.
          </p>
          
          <div className="mt-6 flex flex-col gap-4 w-full">
            <Button 
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-2"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Home
            </Button>
            
            <Button 
              onClick={() => router.back()}
              className="flex items-center justify-center"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 