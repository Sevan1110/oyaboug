"use client";

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
        
        <div className="prose prose-green max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Objet</h2>
            <p>Les présentes conditions générales régissent l'utilisation de la plateforme ouyaboung, service de lutte contre le gaspillage alimentaire au Gabon.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Inscription</h2>
            <p>L'utilisation de ouyaboung nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Services</h2>
            <p>ouyaboung permet aux commerçants de proposer des produits à prix réduits et aux consommateurs d'acheter ces produits. Les transactions sont effectuées directement entre les parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Responsabilités</h2>
            <p>ouyaboung agit en tant qu'intermédiaire. Les commerçants sont responsables de la qualité et de la conformité des produits proposés.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Paiements</h2>
            <p>Les paiements sont effectués via les moyens de paiement disponibles sur la plateforme. Un QR code unique est généré après paiement pour la récupération.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Contact</h2>
            <p>Pour toute question, contactez-nous à support@ouyaboung.ga</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
