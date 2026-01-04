import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Comment fonctionne ouyaboung ?",
    answer: "ouyaboung connecte les commerces ayant des invendus avec les consommateurs. Vous pouvez réserver des paniers surprises à prix réduits et les récupérer dans les créneaux indiqués.",
  },
  {
    question: "Qu'est-ce qu'un panier surprise ?",
    answer: "Un panier surprise contient un assortiment de produits invendus sélectionnés par le commerçant. La composition varie selon les disponibilités du jour, ce qui en fait une surprise à chaque fois !",
  },
  {
    question: "Comment payer ma commande ?",
    answer: "Vous pouvez payer via Mobile Money (Orange Money, Wave, etc.) ou par carte bancaire. Certains paniers peuvent être gratuits dans le cadre d'actions solidaires.",
  },
  {
    question: "Puis-je annuler ma réservation ?",
    answer: "Oui, vous pouvez annuler votre réservation jusqu'à 2 heures avant le créneau de retrait. Au-delà, l'annulation n'est plus possible pour permettre au commerçant de s'organiser.",
  },
  {
    question: "Comment devenir commerçant partenaire ?",
    answer: "C'est simple ! Inscrivez-vous en tant que commerçant, remplissez les informations de votre établissement, et une fois validé, vous pourrez publier vos invendus.",
  },
  {
    question: "Y a-t-il des frais pour les commerçants ?",
    answer: "ouyaboung prélève une petite commission sur chaque vente réalisée. Cela nous permet de maintenir et développer la plateforme tout en restant accessible à tous.",
  },
];

const FAQ = () => {
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
            Questions <span className="text-gradient">fréquentes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur ouyaboung.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-2xl border border-border px-6 shadow-sm"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5 text-foreground font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
