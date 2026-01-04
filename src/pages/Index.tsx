import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImpactStats from "@/components/ImpactStats";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import { ArrowRight, MapPin, Store } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
                Sauvez de la nourriture,{" "}
                <span className="text-gradient">faites des économies</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Récupérez des invendus de qualité à petit prix près de chez vous.
                Ensemble, luttons contre le gaspillage alimentaire.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/search">
                <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                  <MapPin className="w-5 h-5" />
                  Trouver des invendus
                </Button>
              </Link>
              <Link to="/auth?role=merchant">
                <Button variant="outline" size="xl" className="gap-2 w-full sm:w-auto">
                  <Store className="w-5 h-5" />
                  Je suis commerçant
                </Button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground mt-6"
            >
              Déjà +1800 commerces partenaires • +89 000 utilisateurs actifs
            </motion.p>
          </div>
        </div>
      </section>

      {/* <ImpactStats />
      <HowItWorks />
      <Testimonials />
      <FAQ /> */}

      {/* Final CTA */}
      {/* <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Prêt à sauver de la nourriture ?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Rejoignez notre communauté et commencez à faire la différence dès aujourd'hui.
            </p>
            <Link to="/auth">
              <Button variant="heroOutline" size="xl" className="gap-2">
                Créer mon compte gratuit
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section> */}

      {/* <Footer /> */}
    </div>
  );
};

export default Index;
