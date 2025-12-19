import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Leaf, User, Store, Mail, Lock, Phone, ArrowLeft } from "lucide-react";
import { useState } from "react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "merchant" ? "merchant" : "user";
  const [role, setRole] = useState<"user" | "merchant">(initialRole);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">SaveFood</span>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bienvenue !</CardTitle>
            <CardDescription>
              Connectez-vous ou créez un compte pour commencer
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Role Selection */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setRole("user")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  role === "user"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <User className={`w-6 h-6 mx-auto mb-2 ${role === "user" ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`text-sm font-medium ${role === "user" ? "text-primary" : "text-muted-foreground"}`}>
                  Utilisateur
                </p>
              </button>
              <button
                onClick={() => setRole("merchant")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  role === "merchant"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Store className={`w-6 h-6 mx-auto mb-2 ${role === "merchant" ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`text-sm font-medium ${role === "merchant" ? "text-primary" : "text-muted-foreground"}`}>
                  Commerçant
                </p>
              </button>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="login-email" type="email" placeholder="votre@email.com" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="login-password" type="password" placeholder="••••••••" className="pl-10" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Se souvenir de moi
                    </Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Button className="w-full" size="lg">
                  Se connecter
                </Button>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="space-y-4">
                {role === "merchant" && (
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Nom du commerce</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="business-name" placeholder="Ma Boulangerie" className="pl-10" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="votre@email.com" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-phone" type="tel" placeholder="+33 6 12 34 56 78" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="signup-password" type="password" placeholder="••••••••" className="pl-10" />
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="cgu" className="mt-1" />
                  <Label htmlFor="cgu" className="text-sm text-muted-foreground cursor-pointer">
                    J'accepte les{" "}
                    <Link to="/cgu" className="text-primary hover:underline">
                      conditions d'utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      politique de confidentialité
                    </Link>
                  </Label>
                </div>
                <Button className="w-full" size="lg">
                  Créer mon compte
                </Button>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <Separator />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                ou
              </span>
            </div>

            <Button variant="outline" className="w-full gap-2" size="lg">
              <Phone className="w-4 h-4" />
              Continuer avec OTP
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
