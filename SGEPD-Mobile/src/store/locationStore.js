import { create } from 'zustand';
import { fetchLocations, createLocation, updateLocation, deleteLocation } from '../services/locationService';

const useLocationStore = create((set, get) => ({
  locations: [],
  loading: false,
  error: null,

  loadLocations: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchLocations();
      set({ locations: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addLocation: async (locationData) => {
    const newLocation = await createLocation(locationData);
    set((state) => ({ locations: [...state.locations, newLocation] }));
    return newLocation;
  },

  editLocation: async (id, locationData) => {
    const updated = await updateLocation(id, locationData);
    set((state) => ({
      locations: state.locations.map((l) => (l.id === id ? updated : l)),
    }));
    return updated;
  },

  removeLocation: async (id) => {
    await deleteLocation(id);
    set((state) => ({ locations: state.locations.filter((l) => l.id !== id) }));
  },
}));

export default useLocationStore;