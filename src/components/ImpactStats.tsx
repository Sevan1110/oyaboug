import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, TrendingDown, ShoppingBag, Users } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const stats = [
  {
    icon: Leaf,
    value: 125430,
    suffix: " kg",
    label: "Nourriture sauvée",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: TrendingDown,
    value: 312,
    suffix: " T",
    label: "CO₂ évité",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: ShoppingBag,
    value: 1847,
    suffix: "",
    label: "Commerces partenaires",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Users,
    value: 89420,
    suffix: "",
    label: "Utilisateurs actifs",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const ImpactStats = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Notre impact <span className="text-gradient">en temps réel</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ensemble, nous faisons la différence. Voici ce que notre communauté a accompli.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="stat-card text-center h-full">
                <CardContent className="p-6 relative z-10">
                  <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
