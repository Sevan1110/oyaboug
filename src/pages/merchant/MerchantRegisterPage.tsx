// ============================================
// Merchant Registration Page - Business Signup Form
// ouyaboung Platform - Anti-gaspillage alimentaire
// ============================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Store,
  Upload,
  MapPin,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Leaf,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { requireSupabaseClient } from "@/api/supabaseClient";

// Validation schema
const merchantFormSchema = z.object({
  // Step 1: Business Info
  business_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  business_type: z.string().min(1, "Sélectionnez un type d'activité"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères").max(500),

  // Step 2: Contact Info
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide").max(20),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(1, "Ville requise"),
  quartier: z.string().min(2, "Quartier requis"),

  // Step 3: Documents
  rccm_number: z.string().optional(),
  nif_number: z.string().optional(),

  // Terms
  accept_terms: z.boolean().refine(val => val === true, "Vous devez accepter les conditions"),
  accept_anti_waste: z.boolean().refine(val => val === true, "Vous devez vous engager contre le gaspillage"),
});

type MerchantFormData = z.infer<typeof merchantFormSchema>;

const businessTypes = [
  { value: "restaurant", label: "Restaurant" },
  { value: "bakery", label: "Boulangerie / Pâtisserie" },
  { value: "supermarket", label: "Supermarché" },
  { value: "grocery", label: "Épicerie" },
  { value: "butcher", label: "Boucherie" },
  { value: "hotel", label: "Hôtel" },
  { value: "caterer", label: "Traiteur" },
  { value: "other", label: "Autre" },
];

const cities = [
  { value: "libreville", label: "Libreville" },
  { value: "port-gentil", label: "Port-Gentil" },
  { value: "franceville", label: "Franceville" },
  { value: "oyem", label: "Oyem" },
  { value: "moanda", label: "Moanda" },
];

const MerchantRegisterPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    logo?: File;
    rccm?: File;
    nif?: File;
  }>({});

  const form = useForm<MerchantFormData>({
    resolver: zodResolver(merchantFormSchema),
    defaultValues: {
      business_name: "",
      business_type: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      quartier: "",
      rccm_number: "",
      nif_number: "",
      accept_terms: false,
      accept_anti_waste: false,
    },
  });

  const totalSteps = 4;

  const handleFileUpload = (type: 'logo' | 'rccm' | 'nif') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 5MB");
        return;
      }
      setUploadedFiles(prev => ({ ...prev, [type]: file }));
      toast.success(`${type === 'logo' ? 'Logo' : 'Document'} uploadé avec succès`);
    }
  };

  const uploadFileToSupabase = async (file: File, path: string) => {
    try {
      const supabase = requireSupabaseClient();

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error } = await supabase.storage
        .from('merchant-documents')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      const { data } = supabase.storage
        .from('merchant-documents')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Supabase client error:', error);
      return null;
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof MerchantFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['business_name', 'business_type', 'description'];
        break;
      case 2:
        fieldsToValidate = ['email', 'phone', 'address', 'city', 'quartier'];
        break;
      case 3:
        // Documents are optional
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: MerchantFormData) => {
    setIsSubmitting(true);

    try {
      const supabase = requireSupabaseClient();

      // 1. Upload files
      let logoUrl = null;
      let rccmUrl = null; // Ideally store in a separate documents field, but schema uses 'logo_url' and no dedicated doc columns currently visible in simple schema. 
      // We will assume basic insert for now. For docs, we might put them in metadata or just log them.
      // Wait, let's just upload logo to 'logo_url' if present.

      if (uploadedFiles.logo) {
        logoUrl = await uploadFileToSupabase(uploadedFiles.logo, 'logos');
      }

      // 2. Insert merchant application (NOT active until admin validates)
      const { error } = await supabase
        .from('merchants')
        .insert({
          business_name: data.business_name,
          business_type: data.business_type,
          description: data.description,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          quartier: data.quartier,
          logo_url: logoUrl,
          user_id: null,  // No user_id until admin validates and merchant creates account
          is_verified: false,  // Pending admin validation
          is_active: false,  // NOT active until validated
          is_refused: false
        });

      if (error) throw error;

      toast.success("Demande d'inscription envoyée avec succès!", {
        description: "Notre équipe admin examinera votre dossier sous 48h. Vous recevrez un email de confirmation à " + data.email,
        duration: 8000,
      });

      navigate("/merchant/register/success");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Une erreur est survenue", {
        description: error.message || "Veuillez réessayer plus tard.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step < currentStep
              ? "bg-primary text-primary-foreground"
              : step === currentStep
                ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                : "bg-muted text-muted-foreground"
              }`}
          >
            {step < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step}
          </div>
          {step < 4 && (
            <div
              className={`w-12 h-1 mx-1 rounded ${step < currentStep ? "bg-primary" : "bg-muted"
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <Store className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-semibold">Informations sur votre commerce</h2>
        <p className="text-muted-foreground text-sm">Parlez-nous de votre activité</p>
      </div>

      <FormField
        control={form.control}
        name="business_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom du commerce *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Boulangerie du Quartier" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="business_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type d'activité *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre type d'activité" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Décrivez votre commerce et les types de produits que vous proposez..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Cette description sera visible par les clients
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Logo Upload */}
      <div className="space-y-2">
        <FormLabel>Logo du commerce (optionnel)</FormLabel>
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload('logo')}
            className="hidden"
            id="logo-upload"
          />
          <label htmlFor="logo-upload" className="cursor-pointer">
            {uploadedFiles.logo ? (
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <span>{uploadedFiles.logo.name}</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Cliquez pour uploader votre logo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG jusqu'à 5MB
                </p>
              </>
            )}
          </label>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-semibold">Coordonnées</h2>
        <p className="text-muted-foreground text-sm">Comment vous contacter et vous trouver</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email professionnel *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="contact@commerce.ga" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="+241 XX XX XX XX" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Adresse complète *</FormLabel>
            <FormControl>
              <Input placeholder="Numéro, rue, bâtiment..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ville *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une ville" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.value} value={city.value}>
                      {city.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quartier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quartier *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Louis, Nzeng-Ayong..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <FileText className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-semibold">Documents légaux</h2>
        <p className="text-muted-foreground text-sm">Pour vérifier votre commerce (optionnel mais recommandé)</p>
      </div>

      <FormField
        control={form.control}
        name="rccm_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Numéro RCCM (optionnel)</FormLabel>
            <FormControl>
              <Input placeholder="Votre numéro de registre de commerce" {...field} />
            </FormControl>
            <FormDescription>
              Registre du Commerce et du Crédit Mobilier
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* RCCM Document Upload */}
      <div className="space-y-2">
        <FormLabel>Document RCCM (optionnel)</FormLabel>
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload('rccm')}
            className="hidden"
            id="rccm-upload"
          />
          <label htmlFor="rccm-upload" className="cursor-pointer">
            {uploadedFiles.rccm ? (
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <span>{uploadedFiles.rccm.name}</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Téléversez votre document RCCM
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, PNG, JPG jusqu'à 5MB
                </p>
              </>
            )}
          </label>
        </div>
      </div>

      <FormField
        control={form.control}
        name="nif_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Numéro NIF (optionnel)</FormLabel>
            <FormControl>
              <Input placeholder="Votre numéro d'identification fiscale" {...field} />
            </FormControl>
            <FormDescription>
              Numéro d'Identification Fiscale
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* NIF Document Upload */}
      <div className="space-y-2">
        <FormLabel>Document NIF (optionnel)</FormLabel>
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload('nif')}
            className="hidden"
            id="nif-upload"
          />
          <label htmlFor="nif-upload" className="cursor-pointer">
            {uploadedFiles.nif ? (
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <span>{uploadedFiles.nif.name}</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Téléversez votre document NIF
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, PNG, JPG jusqu'à 5MB
                </p>
              </>
            )}
          </label>
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            💡 Les commerces avec documents vérifiés bénéficient d'un badge "Vérifié"
            et sont mis en avant dans les résultats de recherche.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <Leaf className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-semibold">Engagement anti-gaspillage</h2>
        <p className="text-muted-foreground text-sm">Confirmez votre engagement</p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Récapitulatif de votre demande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Commerce</span>
            <span className="font-medium">{form.watch("business_name") || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium">
              {businessTypes.find(t => t.value === form.watch("business_type"))?.label || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ville</span>
            <span className="font-medium">
              {cities.find(c => c.value === form.watch("city"))?.label || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{form.watch("email") || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Documents</span>
            <span className="font-medium">
              {Object.keys(uploadedFiles).filter(k => uploadedFiles[k as keyof typeof uploadedFiles]).length} fichier(s)
            </span>
          </div>
        </CardContent>
      </Card>

      <FormField
        control={form.control}
        name="accept_terms"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                J'accepte les{" "}
                <Link to="/legal/terms" className="text-primary underline">
                  conditions générales d'utilisation
                </Link>{" "}
                et la{" "}
                <Link to="/legal/privacy" className="text-primary underline">
                  politique de confidentialité
                </Link>
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="accept_anti_waste"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-foreground">
                Je m'engage à lutter contre le gaspillage alimentaire en proposant
                mes invendus à prix réduit sur la plateforme ouyaboung
              </FormLabel>
              <FormDescription>
                En rejoignant ouyaboung, vous contribuez à réduire le gaspillage alimentaire au Gabon
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Devenir partenaire <span className="text-gradient">ouyaboung</span>
            </h1>
            <p className="text-muted-foreground">
              Rejoignez le mouvement anti-gaspillage et valorisez vos invendus
            </p>
          </motion.div>

          {renderStepIndicator()}

          <Card>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}

                  <div className="flex justify-between mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Précédent
                    </Button>

                    {currentStep < totalSteps ? (
                      <Button type="button" onClick={nextStep} className="gap-2">
                        Suivant
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting} className="gap-2">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            Soumettre ma demande
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Déjà partenaire ?{" "}
            <Link to="/auth" className="text-primary hover:underline">
              Connectez-vous
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MerchantRegisterPage;
