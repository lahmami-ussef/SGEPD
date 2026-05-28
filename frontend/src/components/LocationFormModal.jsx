import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Search, Loader } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationFormModal = ({ isOpen, onClose, formData, setFormData, onSubmit, isEditing, screens }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = parseFloat(formData.latitude) || 33.5731;
    const initialLng = parseFloat(formData.longitude) || -7.5898;
    const zoom = formData.latitude ? 14 : 6;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([initialLat, initialLng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    if (formData.latitude && formData.longitude) {
      markerRef.current = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
      markerRef.current.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        updateCoords(lat, lng);
        reverseGeocode(lat, lng);
      });
    }

    map.on('click', (e) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [isOpen]);

  const placeMarker = (lat, lng) => {
    if (!mapInstanceRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstanceRef.current);
      markerRef.current.on('dragend', (e) => {
        const { lat: la, lng: ln } = e.target.getLatLng();
        updateCoords(la, ln);
        reverseGeocode(la, ln);
      });
    }
    updateCoords(lat, lng);
  };

  const updateCoords = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
    }));
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data = await res.json();
      if (data?.address) {
        const a = data.address;
        setFormData(prev => ({
          ...prev,
          address: data.display_name?.split(',').slice(0, 3).join(',').trim() || prev.address,
          city: a.city || a.town || a.village || a.county || prev.city,
          country: a.country || prev.country,
          postalCode: a.postcode || prev.postalCode,
          region: a.state || prev.region,
        }));
      }
    } catch (e) {
      console.warn('Reverse geocoding échoué', e);
    }
  };

  const searchOnMap = async () => {
    if (!searchAddress.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data = await res.json();
      if (data?.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        mapInstanceRef.current?.setView([lat, lng], 15);
        placeMarker(lat, lng);
        reverseGeocode(lat, lng);
      } else {
        alert('Adresse non trouvée.');
      }
    } catch {
      alert('Erreur lors de la recherche.');
    } finally {
      setSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-[#0f172a] rounded-2xl border border-white/5 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0f172a] z-10">
          <div>
            <h3 className="font-bold text-white text-sm">
              {isEditing ? 'Modifier la localisation' : 'Ajouter une localisation'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Cliquez sur la carte ou recherchez une adresse</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {/* Écran */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Écran associé</label>
            <select
              value={formData.screenId}
              onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
              required
              className="w-full h-10 px-3 bg-slate-900 border border-white/5 text-white rounded-xl text-xs font-semibold outline-none focus:border-emerald-500/50 transition-all cursor-pointer"
            >
              <option value="">— Sélectionner un écran —</option>
              {screens.map(s => (
                <option key={s.id} value={s.id}>Monitor #{s.id} — {s.name}</option>
              ))}
            </select>
          </div>

          {/* Recherche */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rechercher une adresse</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchOnMap())}
                  placeholder="Ex: Casablanca, Hay Mohammadi..."
                  className="w-full h-10 pl-9 pr-4 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none text-xs font-semibold transition-all"
                />
              </div>
              <button
                type="button"
                onClick={searchOnMap}
                disabled={searching}
                className="h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {searching ? <Loader size={14} className="animate-spin" /> : <Search size={14} />}
                <span>{searching ? 'Recherche...' : 'Chercher'}</span>
              </button>
            </div>
          </div>

          {/* Carte */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin size={12} className="text-emerald-400" />
              Cliquez sur la carte — marqueur déplaçable
            </label>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <div ref={mapRef} style={{ height: '320px', width: '100%' }} />
            </div>
            {formData.latitude && formData.longitude && (
              <div className="mt-2 flex gap-6">
                <span className="text-[11px] font-mono font-bold text-emerald-400">Lat: {formData.latitude}</span>
                <span className="text-[11px] font-mono font-bold text-blue-400">Lng: {formData.longitude}</span>
              </div>
            )}
          </div>

          {/* Champs auto-remplis */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'address', label: 'Adresse', full: true },
              { key: 'city', label: 'Ville' },
              { key: 'country', label: 'Pays' },
              { key: 'region', label: 'Région' },
              { key: 'postalCode', label: 'Code Postal' },
            ].map(({ key, label, full }) => (
              <div key={key} className={full ? 'col-span-2' : ''}>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
                <input
                  type="text"
                  value={formData[key] || ''}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  placeholder="Auto-rempli via la carte"
                  className="w-full h-10 px-3 bg-slate-900 border border-white/5 text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500/50 outline-none text-xs font-semibold transition-all"
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-4 h-10 border border-white/5 hover:border-white/10 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer">
              Annuler
            </button>
            <button
              type="submit"
              disabled={!formData.latitude || !formData.longitude || !formData.screenId}
              className="px-5 h-10 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {isEditing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationFormModal;