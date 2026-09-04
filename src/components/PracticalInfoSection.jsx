import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Calendar, Clock, Navigation, Car, Bike, Train, ExternalLink } from 'lucide-react';

export const PracticalInfoSection = () => {
  const { eventInfo } = useApp();

  // Google Maps embed URL for 9 Avenue Hoche, 75008 Paris
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(eventInfo.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="infos" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-block px-3 py-1 bg-blue-50 text-blue-900 rounded-full text-xs font-semibold tracking-wider uppercase mb-2">
            Venir à l'événement
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Informations Pratiques
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Toutes les indications pour vous rendre à la 16ème édition de la Journée Small & Mid Caps.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Key Event Cards */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            
            <div className="space-y-4">
              {/* Date Card */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex items-start space-x-4">
                <div className="p-3 bg-blue-900 text-white rounded-xl shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Date</h3>
                  <p className="text-lg font-bold text-slate-900 mt-0.5 font-display">{eventInfo.dateFormatted}</p>
                  <p className="text-xs text-slate-500 mt-1">Événement exclusivement réservé sur pré-inscription</p>
                </div>
              </div>

              {/* Hours Card */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex items-start space-x-4">
                <div className="p-3 bg-blue-900 text-white rounded-xl shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Horaires</h3>
                  <p className="text-lg font-bold text-slate-900 mt-0.5 font-display">08h30 – 18h00</p>
                  <p className="text-xs text-slate-500 mt-1">Accueil à partir de 08h30, premier créneau à 09h00</p>
                </div>
              </div>

              {/* Address Card */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex items-start space-x-4">
                <div className="p-3 bg-blue-900 text-white rounded-xl shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Lieu & Adresse</h3>
                  <p className="text-lg font-bold text-slate-900 mt-0.5 font-display">{eventInfo.locationName}</p>
                  <p className="text-sm text-slate-700 font-medium mt-0.5">{eventInfo.address}</p>
                </div>
              </div>
            </div>

            {/* Transport details */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-900" />
                Accès & Transports
              </h4>

              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <Train className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 font-semibold">Métro :</strong>
                    <p className="text-slate-600 text-xs">{eventInfo.metroAccess}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Train className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 font-semibold">RER :</strong>
                    <p className="text-slate-600 text-xs">{eventInfo.rerAccess}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Car className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 font-semibold">Parking :</strong>
                    <p className="text-slate-600 text-xs">{eventInfo.parkingAccess}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Bike className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 font-semibold">Vélo :</strong>
                    <p className="text-slate-600 text-xs">{eventInfo.bikeAccess}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Embedded Real Google Maps Iframe */}
          <div className="lg:col-span-7 h-full min-h-[460px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative shadow-sm flex flex-col">
            
            {/* Map Header Bar */}
            <div className="bg-white px-5 py-3.5 border-b border-slate-200 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-900" />
                <span className="text-sm font-bold text-slate-900 font-display">Plan d'accès Google Maps</span>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(eventInfo.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
              >
                <span>Agrandir la carte</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Live Interactive Iframe */}
            <div className="flex-1 w-full relative min-h-[380px]">
              <iframe
                title="Google Maps EuroLand Corporate"
                width="100%"
                height="100%"
                className="absolute inset-0 border-0"
                loading="lazy"
                allowFullScreen
                src={mapsEmbedUrl}
              ></iframe>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
