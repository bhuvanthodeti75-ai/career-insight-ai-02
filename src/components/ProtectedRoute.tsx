import { forwardRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = forwardRef<HTMLDivElement, ProtectedRouteProps>(
  ({ children }, ref) => {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div ref={ref} className="min-h-screen flex items-center justify-center hero-gradient">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/auth" replace />;
    }

    // Wrap children in a div so we can safely accept refs from router/parent systems.
    return (
      <div ref={ref} className="min-h-screen">
        {children}
      </div>
    );
  }
);

ProtectedRoute.displayName = "ProtectedRoute";