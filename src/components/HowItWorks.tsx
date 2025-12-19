import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ShoppingBag, MapPin, Smile } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Recherchez",
    description: "Trouvez des invendus près de chez vous grâce à notre carte interactive.",
  },
  {
    icon: ShoppingBag,
    title: "Réservez",
    description: "Choisissez un panier surprise et réservez-le en quelques clics.",
  },
  {
    icon: MapPin,
    title: "Récupérez",
    description: "Passez chercher votre commande dans le créneau indiqué.",
  },
  {
    icon: Smile,
    title: "Savourez",
    description: "Profitez de produits de qualité tout en faisant un geste pour la planète.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-card/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comment ça <span className="text-gradient">marche ?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            C'est simple, rapide et efficace. En 4 étapes, sauvez de la nourriture.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-20 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary via-primary to-primary/30" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="text-center h-full border-0 bg-transparent shadow-none">
                <CardContent className="p-6">
                  <div className="relative mx-auto mb-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg relative z-10">
                      <step.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-md z-20">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
