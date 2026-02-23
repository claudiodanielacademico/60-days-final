import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Shield, Crown } from "lucide-react";
import { motion } from "framer-motion";

const Pricing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const plans = [
        {
            name: "Semanal",
            price: "R$ 9,90",
            period: "por semana",
            description: "Ideal para experimentar a jornada.",
            features: ["Acesso total aos 60 dias", "Comunidade VIP", "Suporte prioritário"],
            link: "https://pay.kirvano.com/SEU-LINK-SEMANAL", // User should replace these
            icon: <Zap className="h-5 w-5 text-yellow-500" />,
            color: "bg-yellow-500/10"
        },
        {
            name: "Mensal",
            price: "R$ 29,90",
            period: "por mês",
            description: "O plano mais equilibrado para sua fé.",
            features: ["Tudo do Semanal", "Acesso contínuo", "Descontos em eventos"],
            link: "https://pay.kirvano.com/SEU-LINK-MENSAL",
            icon: <Star className="h-5 w-5 text-primary" />,
            highlight: true,
            color: "bg-primary/10"
        },
        {
            name: "Anual",
            price: "R$ 197,90",
            period: "por ano",
            description: "Compromisso total com sua evolução.",
            features: ["Tudo do Mensal", "Economize 40%", "Mentorias exclusivas"],
            link: "https://pay.kirvano.com/SEU-LINK-ANUAL",
            icon: <Crown className="h-5 w-5 text-purple-500" />,
            color: "bg-purple-500/10"
        }
    ];

    const handleSubscribe = (link: string) => {
        // Adiciona o e-mail do usuário como parâmetro de entrada se a Kirvano suportar
        const checkoutUrl = user?.email
            ? `${link}?email=${encodeURIComponent(user.email)}`
            : link;

        window.open(checkoutUrl, "_blank");
    };

    return (
        <div className="min-h-screen bg-background py-12 px-6">
            <div className="mx-auto max-w-4xl text-center mb-12">
                <h1 className="font-display text-4xl font-bold mb-4">Escolha seu Plano de Fé</h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Tenha acesso ilimitado à jornada de 60 dias e fortaleça sua conexão espiritual diariamente.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {plans.map((plan, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`relative flex flex-col h-full ${plan.highlight ? 'border-primary shadow-lg scale-105' : 'border-border'}`}>
                            {plan.highlight && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase">
                                    Recomendado
                                </div>
                            )}
                            <CardHeader>
                                <div className={`h-12 w-12 rounded-xl ${plan.color} flex items-center justify-center mb-4`}>
                                    {plan.icon}
                                </div>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="mb-6">
                                    <span className="text-3xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={plan.highlight ? "default" : "outline"}
                                    onClick={() => handleSubscribe(plan.link)}
                                >
                                    Assinar Agora
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Pagamento seguro via Kirvano
            </div>
        </div>
    );
};

export default Pricing;
