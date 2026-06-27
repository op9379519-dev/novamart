import React, { useState, useEffect } from "react";
import { Order } from "../types";
import { AlertCircle, Camera, Check, Clock, Trash, HelpCircle, ShieldAlert } from "lucide-react";

interface Complaint {
  id: string;
  orderId: string;
  productName: string;
  subject: string;
  description: string;
  photoUrl: string;
  status: "Pending Investigation" | "Assigned to Expert" | "Resolution Approved" | "Refund Generated";
  date: string;
}

interface UserSupportPageProps {
  orders: Order[];
  currentUser: { id: string; name: string } | null;
  lang: "en" | "hi" | "es";
}

const translations = {
  en: {
    title: "⚠️ Dispute Audit & Complaint Filing Center",
    sub: "Lodge detailed product mismatch claims or delivery friction claims to senior auditors.",
    formTitle: "Lodge New Quality Complaint",
    selectOrder: "Select Purchased Merchandise",
    subject: "Brief Complaint Subject",
    subjectPlaceholder: "e.g., Cable insulation tearing / Package box is dented",
    desc: "Explain Issue In Detail",
    descPlaceholder: "Describe specifically what is damaged or missing...",
    photo: "Attach Evidence Screenshot / Photo (supports drag & drop)",
    photoActive: "✓ Evidence Capture Successful! Click here to upload a different photo.",
    photoCapacity: "Limit: Maximum 2MB",
    submit: "File Quality Complaint Claim",
    history: "My active Support Disputes History",
    emptyHist: "No ongoing dispute cases registered. Excellent product standards met!",
    statusLabel: "Investigation State"
  },
  hi: {
    title: "⚠️ विवाद समाधान और शिकायत केंद्र",
    sub: "गुणवत्ता विसंगतियों या डिलीवरी समस्याओं के त्वरित समाधान के लिए शिकायत दर्ज करें।",
    formTitle: "नई गुणवत्ता शिकायत दर्ज करें",
    selectOrder: "खरीदी गई सामग्री का चयन करें",
    subject: "शिकायत का संक्षिप्त विषय",
    subjectPlaceholder: "उदा: केबल में दरार / बॉक्स कटा-फटा हुआ है",
    desc: "समस्या का विस्तृत विवरण",
    descPlaceholder: "कृपया विस्तार से बताएं कि कौन सा भाग क्षतिग्रस्त है...",
    photo: "साक्ष्य फोटो संलग्न करें (ड्रैग एंड ड्रॉप उपलब्ध है)",
    photoActive: "✓ साक्ष्य फोटो अपलोड सफल! फोटो बदलने के लिए यहाँ क्लिक करें।",
    photoCapacity: "सीमा: अधिकतम 2MB",
    submit: "गुणवत्ता शिकायत दर्ज करें",
    history: "मेरी सक्रिय शिकायतें",
    emptyHist: "कोई लंबित शिकायत नहीं है। उत्कृष्ट सुचारू वितरण स्थापित!",
    statusLabel: "जाँच की स्थिति"
  },
  es: {
    title: "⚠️ Centro de Quejas y Disputas de Calidad",
    sub: "Presente reclamaciones de inconformidad de entrega o daño de artículo ante auditores.",
    formTitle: "Registrar Nueva Queja",
    selectOrder: "Seleccionar Mercancía Adquirida",
    subject: "Asunto Breve de la Queja",
    subjectPlaceholder: "ej., Cable de corriente roto / Caja del paquete dañada",
    desc: "Explicar el Problema con Detalles",
    descPlaceholder: "Describa detalladamente el defecto del producto...",
    photo: "Fijar Foto de Evidencia (admite arrastrar y soltar)",
    photoActive: "✓ ¡Evidencia capturada! Haga clic para cambiar la foto.",
    photoCapacity: "Límite: Máximo 2MB",
    submit: "Enviar Formulario de Disputa",
    history: "Historial de Tickets de Disputas",
    emptyHist: "No hay casos de disputa abiertos. ¡Consistencia de entrega excelente!",
    statusLabel: "Fase de Auditoría"
  }
};

export default function UserSupportPage({ orders, currentUser, lang }: UserSupportPageProps) {
  const t = translations[lang] || translations.en;

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [base64Photo, setBase64Photo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userUserId = currentUser?.id || "guest";

  // Load complaints from localStorage to persist entries
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`novamart_complaints_${userUserId}`);
      if (saved) {
        setComplaints(JSON.parse(saved));
      } else {
        setComplaints([]);
      }
    } catch {
      setComplaints([]);
    }
  }, [userUserId]);

  const saveComplaints = (updated: Complaint[]) => {
    setComplaints(updated);
    try {
      localStorage.setItem(`novamart_complaints_${userUserId}`, JSON.stringify(updated));
    } catch (e) {
      console.error("Storage save issue:", e);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Convert File Input safely to Base64 (max limit 2MB)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearMessages();
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("⚠️ Image exceeds capacity (max 2MB capacity for reliable offline storage).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBase64Photo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLodgeComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!selectedProduct) {
      setError("⚠️ Please identify the purchased product from the dropdown list.");
      return;
    }
    if (!subject.trim()) {
      setError("⚠️ Please state the brief subject of this dispute case.");
      return;
    }
    if (!desc.trim()) {
      setError("⚠️ Please explain the issues with your product in detail.");
      return;
    }

    // Extract product details and orderId from selected dropdown item
    const [pName, ordId] = selectedProduct.split("|");

    const newTicket: Complaint = {
      id: `DIS-COM-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: ordId || "GEN-ORD",
      productName: pName,
      subject: subject.trim(),
      description: desc.trim(),
      photoUrl: base64Photo || "https://images.unsplash.com/photo-1590247813693-5541f1c609fd?auto=format&fit=crop&q=80&w=400",
      status: "Pending Investigation",
      date: new Date().toISOString().split("T")[0]
    };

    const updated = [newTicket, ...complaints];
    saveComplaints(updated);

    // Reset fields
    setSubject("");
    setDesc("");
    setBase64Photo("");
    setSuccess("✓ Dispute lodged successfully! Senior audit agents will inspect details and initiate resolution guidelines.");

    // Simulated response transition after 4 seconds
    setTimeout(() => {
      setComplaints((prev) => {
        const next = prev.map((c) =>
          c.id === newTicket.id ? { ...c, status: "Assigned to Expert" as const } : c
        );
        try {
          localStorage.setItem(`novamart_complaints_${userUserId}`, JSON.stringify(next));
        } catch {}
        return next;
      });
    }, 4000);
  };

  const handleDeleteComplaint = (complaintId: string) => {
    const updated = complaints.filter(c => c.id !== complaintId);
    saveComplaints(updated);
  };

  // Extract list of distinct purchased merchandise
  const userOrders = orders.filter(o => o.buyerId === userUserId);
  const dropdownProducts: { name: string; orderId: string }[] = [];
  userOrders.forEach((o) => {
    o.items.forEach((item) => {
      dropdownProducts.push({
        name: item.productName,
        orderId: o.id
      });
    });
  });

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto py-4 select-none min-h-[60vh]" id="dispute-support-resolution-page">
      
      {/* Title block */}
      <div className="space-y-2 border-b pb-4 border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          {t.title}
        </h2>
        <p className="text-xs text-neutral-400 font-medium leading-relaxed">
          {t.sub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Container */}
        <form 
          onSubmit={handleLodgeComplaint} 
          className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-6 rounded-3xl space-y-4 text-xs"
        >
          <div className="border-b pb-2 flex justify-between items-center">
            <span className="font-extrabold text-neutral-900 dark:text-white text-sm block">
              {t.formTitle}
            </span>
            <ShieldAlert size={14} className="text-red-500" />
          </div>

          {error && (
            <p className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 font-semibold rounded-xl text-[11px] leading-relaxed">
              {error}
            </p>
          )}

          {success && (
            <p className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold rounded-xl text-[11px] leading-relaxed">
              {success}
            </p>
          )}

          <div className="space-y-1">
            <label className="font-extrabold text-neutral-400 block uppercase text-[10px] tracking-wider">{t.selectOrder}</label>
            <select
              value={selectedProduct}
              onChange={(e) => { clearMessages(); setSelectedProduct(e.target.value); }}
              className="w-full p-3 font-semibold rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-800 dark:bg-neutral-950 dark:border-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              required
            >
              <option value="">-- Choose Purchased Merchandise Item --</option>
              {dropdownProducts.map((p, index) => (
                <option key={index} value={`${p.name}|${p.orderId}`}>
                  {p.name} (In Order {p.orderId})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-neutral-400 block uppercase text-[10px] tracking-wider">{t.subject}</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => { clearMessages(); setSubject(e.target.value); }}
              placeholder={t.subjectPlaceholder}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-semibold"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-neutral-400 block uppercase text-[10px] tracking-wider">{t.desc}</label>
            <textarea
              rows={4}
              value={desc}
              onChange={(e) => { clearMessages(); setDesc(e.target.value); }}
              placeholder={t.descPlaceholder}
              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-semibold leading-relaxed"
              required
            ></textarea>
          </div>

          {/* Photo upload file control with real base64 image capture */}
          <div className="space-y-15">
            <label className="font-extrabold text-neutral-400 block uppercase text-[10px] tracking-wider">
              {t.photo}
            </label>
            <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-all relative">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                {base64Photo ? (
                  <div className="flex items-center gap-3">
                    <img src={base64Photo} alt="Disputed evidence string" className="w-16 h-16 rounded-xl object-cover border-2 border-red-500" />
                    <div className="text-left">
                      <span className="text-emerald-500 font-bold block text-[11px]">{t.photoActive}</span>
                      <span className="text-neutral-400 tracking-wide block uppercase font-bold text-[9px]">{t.photoCapacity}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="text-neutral-400" size={24} />
                    <span className="text-[11px] text-neutral-500 font-bold">Upload Snapshot (JPG, PNG)</span>
                    <span className="text-[9px] text-neutral-400 tracking-wide font-medium">{t.photoCapacity}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-md shadow-red-500/10"
          >
            {t.submit}
          </button>
        </form>

        {/* Complaints Live Progress History Stack */}
        <div className="lg:col-span-5 space-y-5">
          <span className="text-xs uppercase font-black text-neutral-400 tracking-widest block border-b pb-1.5 flex items-center justify-between">
            <span>{t.history}</span>
            <span className="bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-full text-[10px] text-neutral-500">{complaints.length}</span>
          </span>

          {complaints.length === 0 ? (
            <div className="p-12 border border-dashed text-center rounded-3xl text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/10">
              <HelpCircle className="mx-auto mb-2.5 text-neutral-300" size={28} />
              <p className="text-[11px] font-semibold italic leading-relaxed">{t.emptyHist}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((comp) => (
                <div 
                  key={comp.id} 
                  className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 bg-white dark:bg-neutral-900 space-y-3 shadow-sm relative overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="bg-neutral-100 dark:bg-neutral-950 font-mono text-[9px] font-black text-red-500 px-2 py-0.5 rounded mr-1">
                        {comp.id}
                      </span>
                      <span className="text-[9px] text-neutral-450 font-bold">{comp.date}</span>
                      <h4 className="font-extrabold text-neutral-900 dark:text-white text-xs mt-1 leading-snug">
                        {comp.subject}
                      </h4>
                    </div>

                    <button 
                      onClick={() => handleDeleteComplaint(comp.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors bg-neutral-50 dark:bg-neutral-950 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
                      title="Delete Ticket Record"
                    >
                      <Trash size={12} />
                    </button>
                  </div>

                  <div className="flex gap-3 justify-between items-start bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-100 dark:border-neutral-900 text-[11px]">
                    <div className="space-y-1 min-w-0">
                      <p className="text-[8px] uppercase tracking-wider text-neutral-450 font-black">
                        Item: {comp.productName}
                      </p>
                      <p className="text-neutral-600 dark:text-neutral-300 italic max-w-[220px] truncate leading-relaxed">
                        "{comp.description}"
                      </p>
                    </div>
                    {comp.photoUrl && (
                      <img src={comp.photoUrl} alt="Attached complain slip" className="w-12 h-12 rounded object-cover flex-shrink-0 border bg-white" />
                    )}
                  </div>

                  {/* Status trackbar */}
                  <div className="pt-2 border-t border-dashed flex justify-between items-center text-[10px]">
                    <span className="font-bold text-neutral-400">{t.statusLabel}:</span>
                    <span className={`inline-flex items-center gap-1 font-black uppercase text-[9px] px-2.5 py-0.5 rounded-full ${
                      comp.status === "Pending Investigation"
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      <Clock size={10} /> {comp.status}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
