import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const SubscriptionGate = ({ children }: { children: React.ReactNode }) => {
    const { subscription, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-muted-foreground">
                Carregando...
            </div>
        );
    }

    // Se não estiver ativo e não for o plano gratuito, redireciona para planos
    // Note: No AuthContext configuramos isActive como true para tier 'free'
    if (!subscription?.isActive) {
        return <Navigate to="/pricing" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default SubscriptionGate;
