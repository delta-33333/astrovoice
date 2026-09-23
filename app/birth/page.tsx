'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BirthData } from '@/lib/types';

export default function BirthDataPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<BirthData>({
    name: '',
    date: '',
    time: '',
    timeUnknown: false,
    place: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    // Validation
    const newErrors: string[] = [];
    if (!formData.name.trim()) newErrors.push('Le nom est requis');
    if (!formData.date) newErrors.push('La date de naissance est requise');
    if (!formData.timeUnknown && !formData.time) newErrors.push('L\'heure est requise');
    if (!formData.place.trim()) newErrors.push('Le lieu de naissance est requis');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Store in sessionStorage and navigate
    sessionStorage.setItem('birthData', JSON.stringify(formData));
    router.push('/astrologers');
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-cinzel)] text-4xl sm:text-5xl font-bold mb-4 text-glow">
            Votre Thème Natal
          </h1>
          <p className="text-white/70 text-lg">
            Pour préparer votre consultation, nous avons besoin de vos coordonnées de naissance complètes.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Prénom et nom
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50 transition-all"
              placeholder="Marie Dupont"
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-2">
              Date de naissance
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50 transition-all"
            />
          </div>

          {/* Time */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium mb-2">
              Heure de naissance
            </label>
            <input
              type="time"
              id="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              disabled={formData.timeUnknown}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label className="flex items-center gap-2 mt-3 text-sm text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.timeUnknown}
                onChange={(e) => setFormData({ ...formData, timeUnknown: e.target.checked, time: '' })}
                className="w-4 h-4 rounded border-white/20"
              />
              Heure de naissance inconnue
            </label>
          </div>

          {/* Place */}
          <div>
            <label htmlFor="place" className="block text-sm font-medium mb-2">
              Lieu de naissance
            </label>
            <input
              type="text"
              id="place"
              value={formData.place}
              onChange={(e) => setFormData({ ...formData, place: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-celestial-purple focus:ring-2 focus:ring-celestial-purple/50 transition-all"
              placeholder="Paris, France"
            />
            <p className="mt-2 text-xs text-white/50">
              Ville et pays pour localiser votre thème natal avec précision
            </p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <ul className="text-sm text-red-200 space-y-1">
                {errors.map((error, i) => (
                  <li key={i}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Préparation...' : 'Continuer'}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/50">
            🔒 Vos données sont sécurisées et utilisées uniquement pour votre consultation
          </p>
        </div>
      </div>
    </main>
  );
}
