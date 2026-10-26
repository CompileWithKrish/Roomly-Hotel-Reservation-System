import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRooms } from '../../features/rooms/hooks';
import { formatCurrency, getDefaultBookingDates } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import {
  Search,
  Calendar,
  Users,
  Star,
  Sparkles,
  MapPin,
  ArrowRight,
  Waves,
  Utensils,
  Sparkle,
  Compass,
  Bed,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: rooms } = useRooms();

  const defaultDates = getDefaultBookingDates();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState(defaultDates.checkIn);
  const [checkOut, setCheckOut] = useState(defaultDates.checkOut);
  const [guests, setGuests] = useState('2');
  const [roomType, setRoomType] = useState('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.append('location', location.trim());
    if (roomType !== 'all') params.append('type', roomType);
    if (guests) params.append('guests', guests);
    if (checkIn) params.append('in', checkIn);
    if (checkOut) params.append('out', checkOut);

    navigate(`/rooms?${params.toString()}`);
  };

  const featuredRooms = rooms?.filter((r) => r.featured) || rooms?.slice(0, 3) || [];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[680px] lg:min-h-[750px] flex items-center justify-center text-white overflow-hidden">
        {/* Background Image with subtle gradient overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(19, 27, 46, 0.45) 0%, rgba(19, 27, 46, 0.85) 100%), url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85')`,
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs sm:text-sm font-semibold border border-white/20 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Voted World's Leading Architectural Luxury Hotel 2026
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Curated Stays in Pure <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300">
              Architectural Luxury
            </span>
          </h1>

          <p className="text-base sm:text-xl text-white/85 max-w-2xl mx-auto font-normal leading-relaxed">
            Immerse yourself in panoramic city and coastal views, bespoke gastronomy, and private sanctuary suites designed for the world's most discerning guests.
          </p>

          {/* Booking Search Widget Bar with Location Field */}
          <div className="pt-4 max-w-5xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-surface-container-lowest text-on-surface p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-outline-variant/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-left"
            >
              {/* 1. Location (First Field) */}
              <div className="sm:col-span-2 lg:col-span-2 p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container transition-colors">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Location
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    list="popular-locations"
                    placeholder="Where do you want to stay?"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent font-semibold text-sm text-on-surface placeholder:text-outline focus:outline-none"
                  />
                  <datalist id="popular-locations">
                    <option value="Hyderabad" />
                    <option value="Visakhapatnam" />
                    <option value="Vijayawada" />
                    <option value="Chennai" />
                    <option value="Bengaluru" />
                  </datalist>
                </div>
              </div>

              {/* 2. Check-In */}
              <div className="p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container transition-colors">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Check-In
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-transparent font-semibold text-sm text-on-surface focus:outline-none cursor-pointer"
                />
              </div>

              {/* 3. Check-Out */}
              <div className="p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container transition-colors">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Check-Out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-transparent font-semibold text-sm text-on-surface focus:outline-none cursor-pointer"
                />
              </div>

              {/* 4. Guests & Room Type */}
              <div className="p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container transition-colors">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-primary" /> Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-transparent font-semibold text-sm text-on-surface focus:outline-none cursor-pointer"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
              </div>

              {/* 5. Search Button */}
              <div className="sm:col-span-2 lg:col-span-1 flex items-center">
                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="w-full h-full rounded-xl py-3.5 shadow-md flex items-center justify-center gap-2 font-bold"
                >
                  <Search className="w-5 h-5" />
                  Search Rooms
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Trust & Accolades */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-y border-outline-variant/60 py-8">
          <div>
            <p className="text-3xl lg:text-4xl font-extrabold text-primary">5 Key Cities</p>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">Hyderabad, Bengaluru, Chennai & more</p>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-extrabold text-primary">4.95 ★</p>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">Verified Guest Rating</p>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-extrabold text-primary">24/7</p>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">Dedicated Butler Care</p>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-extrabold text-primary">100%</p>
            <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">Cleanliness Guarantee</p>
          </div>
        </div>
      </section>

      {/* Featured Suites Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-primary">Exclusive Sanctuary</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mt-1">
              Featured Suites & Penthouses
            </h2>
            <p className="text-sm text-on-surface-variant mt-2 max-w-xl">
              Each accommodation is masterfully engineered with premium views, Italian marble bathrooms, and bespoke audio-visual immersion.
            </p>
          </div>
          <Link to="/rooms">
            <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Rooms
            </Button>
          </Link>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRooms.map((room) => (
            <div
              key={room.id}
              className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={room.images[0]}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-on-surface shadow-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span>{room.location}</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-on-surface/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{room.rating}</span>
                    <span className="text-white/70">({room.reviewCount})</span>
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="font-semibold text-primary">{room.hotelName}</span>
                    <span className="bg-surface-container px-2 py-0.5 rounded font-medium">{room.type}</span>
                  </div>

                  <h3 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
                    {room.title}
                  </h3>

                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-surface-container text-[11px] font-medium text-on-surface-variant"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-outline-variant/40 mt-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-on-surface-variant">Starting from</span>
                  <p className="text-2xl font-extrabold text-on-surface">
                    {formatCurrency(room.pricePerNight)}
                    <span className="text-xs font-normal text-on-surface-variant"> / night</span>
                  </p>
                </div>
                <Link to={`/rooms/${room.id}`}>
                  <Button variant="primary" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hotel Experiences / Amenities */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-primary">Unrivaled Hospitality</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
              Bespoke Guest Experiences
            </h2>
            <p className="text-sm text-on-surface-variant">
              Every detail is meticulously choreographed to provide effortless rejuvenation and timeless leisure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                <Waves className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">Rooftop Infinity Oasis</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Heated seawater infinity pool with panoramic coastline views, private cabanas, and sunset cocktail service.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                <Utensils className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">Fine Dining & Lounge</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Award-winning contemporary cuisine crafted from organic regional ingredients by master chefs.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                <Sparkle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">Holistic Ayurvedic Spa</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Bespoke hydrotherapy, Himalayan salt sauna, therapeutic massage rituals, and organic herbal facials.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                <Compass className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">City & Coastal Tours</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Guided cultural heritage tours, coastal voyages, and private luxury airport transfers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
