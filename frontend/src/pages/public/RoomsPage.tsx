import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { useRooms } from '../../features/rooms/hooks';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { CreditCardOffersSection } from '../../features/offers/components/CreditCardOffersSection';
import { Offer } from '../../types';
import {
  Search,
  SlidersHorizontal,
  Star,
  Users,
  Maximize2,
  Bed,
  Check,
  MapPin,
  Building2,
  ChevronRight,
  Tag,
  Sparkles,
  X,
} from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const isOffersView = location.pathname === '/offers' || searchParams.get('filter') === 'featured';
  const [selectedOfferForBooking, setSelectedOfferForBooking] = useState<Offer | null>(null);
  const initialLocation = searchParams.get('location') || 'all';
  const initialType = searchParams.get('type') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedType, setSelectedType] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [guestCount, setGuestCount] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    const loc = searchParams.get('location');
    if (loc) setSelectedLocation(loc);
  }, [searchParams]);

  const { data: rooms, isLoading } = useRooms();

  const locationsList = [
    { id: 'all', label: 'All Locations' },
    { id: 'Hyderabad', label: 'Hyderabad' },
    { id: 'Visakhapatnam', label: 'Visakhapatnam' },
    { id: 'Vijayawada', label: 'Vijayawada' },
    { id: 'Chennai', label: 'Chennai' },
    { id: 'Bengaluru', label: 'Bengaluru' },
  ];

  const roomTypes = [
    { id: 'all', label: 'All Accommodations' },
    { id: 'Deluxe Suite', label: 'Deluxe Suite' },
    { id: 'Executive Suite', label: 'Executive Suite' },
    { id: 'Ocean Villa', label: 'Ocean Villa' },
    { id: 'Presidential Suite', label: 'Presidential Suite' },
    { id: 'Standard Room', label: 'Standard Room' },
  ];

  const amenityOptions = [
    'High-Speed Wi-Fi 6',
    'Panoramic City View',
    'Panoramic Ocean View',
    'Marble Jacuzzi Bath',
    'Private Plunge Pool',
    'Complimentary Espresso Bar',
    '24/7 Butler Service',
  ];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    let result = [...rooms];

    // Filter by location
    if (selectedLocation !== 'all' && selectedLocation.trim()) {
      const loc = selectedLocation.toLowerCase();
      result = result.filter(
        (r) =>
          r.location?.toLowerCase().includes(loc) ||
          r.hotelName?.toLowerCase().includes(loc)
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter((r) => r.type.toLowerCase() === selectedType.toLowerCase());
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.hotelName?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    // Filter by price
    result = result.filter((r) => r.pricePerNight <= maxPrice);

    // Filter by guests
    if (guestCount > 0) {
      result = result.filter((r) => r.capacity >= guestCount);
    }

    // Filter by amenities
    if (selectedAmenities.length > 0) {
      result = result.filter((r) =>
        selectedAmenities.every((selected) =>
          r.amenities.some((a) => a.toLowerCase().includes(selected.toLowerCase()))
        )
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [rooms, selectedLocation, selectedType, searchQuery, maxPrice, guestCount, selectedAmenities, sortBy]);

  const handleSelectOfferForBooking = (offer: Offer) => {
    setSelectedOfferForBooking(offer);
    const roomsContainer = document.getElementById('rooms-listing-grid');
    if (roomsContainer) {
      roomsContainer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-outline" />
          <span>{isOffersView ? 'Exclusive Offers & Luxury Suites' : 'Available Rooms'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
          {isOffersView ? 'Offers, Suites & Accommodations' : 'Available Rooms & Suites'}
        </h1>
        <p className="text-sm text-on-surface-variant max-w-2xl">
          Search, compare, and reserve luxury hotel rooms across top destinations including Hyderabad, Visakhapatnam, Bengaluru, Chennai, and Vijayawada.
        </p>
      </div>

      {/* Limited-Time Credit Card Offers Section */}
      <CreditCardOffersSection onSelectOfferForBooking={handleSelectOfferForBooking} />

      {/* Main Filter Section */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location Filter Dropdown */}
          <div className="relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/70 bg-surface-container-low/50 text-sm focus:outline-none focus:border-primary text-on-surface font-semibold"
            >
              {locationsList.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-primary" /> Search Keyword
            </label>
            <input
              type="text"
              placeholder="Search hotel name, suite, or view..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/70 bg-surface-container-low/50 text-sm focus:outline-none focus:border-primary text-on-surface"
            />
          </div>

          {/* Guests Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-primary" /> Capacity
            </label>
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/70 bg-surface-container-low/50 text-sm focus:outline-none focus:border-primary text-on-surface font-medium"
            >
              <option value="0">Any Capacity</option>
              <option value="1">1+ Guest</option>
              <option value="2">2+ Guests</option>
              <option value="4">4+ Guests (Family)</option>
              <option value="6">6+ Guests (Penthouse)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/70 bg-surface-container-low/50 text-sm focus:outline-none focus:border-primary text-on-surface font-medium"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Guest Rating: Highest First</option>
            </select>
          </div>
        </div>

        {/* Room Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {roomTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                selectedType === type.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Price Slider & Amenities Filter */}
        <div className="pt-4 border-t border-outline-variant/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="w-full lg:w-72 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-on-surface">
              <span>Max Nightly Rate</span>
              <span className="text-primary font-bold">{formatCurrency(maxPrice)} / night</span>
            </div>
            <input
              type="range"
              min="200"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant mr-1">Facilities:</span>
            {amenityOptions.map((amenity) => {
              const active = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    active
                      ? 'bg-primary-fixed border-primary text-on-primary-fixed font-semibold shadow-xs'
                      : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:border-outline'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5 text-primary stroke-[3]" />}
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Room Listing Grid with Anchor ID */}
      <div id="rooms-listing-grid" className="scroll-mt-24 space-y-6">
        {selectedOfferForBooking && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 text-emerald-950 dark:text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black">
                  Offer Selected: {selectedOfferForBooking.title} ({selectedOfferForBooking.code})
                </p>
                <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90">
                  Select your preferred luxury room below to proceed to checkout with this offer.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedOfferForBooking(null)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        )}

        {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant space-y-4">
              <Skeleton className="w-full aspect-[16/10] rounded-xl" />
              <Skeleton className="w-3/4 h-6 rounded" />
              <Skeleton className="w-full h-4 rounded" />
              <div className="flex justify-between pt-2">
                <Skeleton className="w-1/3 h-8 rounded" />
                <Skeleton className="w-1/3 h-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-outline">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-on-surface">
            {selectedLocation !== 'all'
              ? `No rooms available in this location.`
              : 'No rooms match your filter criteria.'}
          </h3>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Try choosing another city such as Hyderabad, Visakhapatnam, Bengaluru, or Chennai.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedLocation('all');
              setSelectedType('all');
              setSearchQuery('');
              setMaxPrice(1500);
              setGuestCount(0);
              setSelectedAmenities([]);
            }}
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={room.images[0]}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Location badge on top-left */}
                  <div className="absolute top-3 left-3 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-on-surface shadow-sm flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{room.location}</span>
                  </div>

                  {/* Rating badge on bottom-right */}
                  <div className="absolute bottom-3 right-3 bg-on-surface/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{room.rating}</span>
                    <span className="text-white/70">({room.reviewCount})</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {/* Hotel Name and Availability Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {room.hotelName}
                    </span>
                    <StatusBadge status={room.status} />
                  </div>

                  {/* Room Title */}
                  <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                    {room.title}
                  </h3>

                  {/* Room Type & Capacity */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-outline-variant/40 text-xs text-on-surface-variant font-medium">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-on-surface truncate">{room.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{room.capacity} Guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{room.sizeSqFt} sq ft</span>
                    </div>
                  </div>

                  {/* Facilities / Amenities */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Facilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {room.amenities.slice(0, 3).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-surface-container text-[11px] font-medium text-on-surface-variant"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-surface-container text-[11px] font-medium text-on-surface-variant">
                          +{room.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="p-5 pt-0 border-t border-outline-variant/40 mt-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-on-surface-variant block">Price per night</span>
                  <p className="text-xl font-extrabold text-on-surface">
                    {formatCurrency(room.pricePerNight)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/rooms/${room.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  <Link
                    to={`/checkout?roomId=${room.id}${
                      selectedOfferForBooking ? `&offer=${selectedOfferForBooking.code}` : ''
                    }`}
                  >
                    <Button variant="primary" size="sm">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
