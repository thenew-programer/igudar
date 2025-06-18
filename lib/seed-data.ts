import { PropertyStatus, PropertyType } from '@/types/property';

// Database-compatible property interface
interface DbPropertyInsert {
  title: string;
  description: string;
  location: string;
  city: string;
  region: string;
  price: number; // Will be converted to cents in API
  image_url: string;
  images?: string[];
  min_investment: number; // Will be converted to cents in API
  target_amount: number; // Will be converted to cents in API
  total_raised: number; // Will be converted to cents in API
  expected_roi: number;
  rental_yield: number;
  investment_period: number;
  status: PropertyStatus;
  funding_deadline: string;
  property_type: PropertyType;
  size_sqm: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  parking_spaces?: number;
  amenities?: string[];
  nearby_facilities?: string[];
  construction_year?: number;
  renovation_year?: number;
  monthly_rent?: number; // Will be converted to cents in API
  maintenance_cost?: number; // Will be converted to cents in API
  property_tax?: number; // Will be converted to cents in API
  management_fee?: number;
  total_investors?: number;
  shares_available: number;
  total_shares: number;
  price_per_share: number; // Will be converted to cents in API
}

// Realistic Moroccan property seed data
export const seedProperties: DbPropertyInsert[] = [
  {
    title: 'Luxury Apartment in Casablanca Marina',
    description: 'Modern 3-bedroom apartment with stunning ocean views in the prestigious Marina district. Features include marble floors, high-end appliances, and access to exclusive amenities including pool, gym, and concierge services.',
    location: 'Marina, Casablanca',
    city: 'Casablanca',
    region: 'Casablanca-Settat',
    price: 2500000, // 2.5M MAD
    image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg',
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'
    ],
    min_investment: 25000,
    target_amount: 2500000,
    total_raised: 1875000,
    expected_roi: 12.5,
    rental_yield: 8.2,
    investment_period: 60,
    status: PropertyStatus.FUNDING,
    funding_deadline: '2026-03-15T23:59:59Z',
    property_type: PropertyType.RESIDENTIAL,
    size_sqm: 180,
    bedrooms: 3,
    bathrooms: 2,
    floors: 1,
    parking_spaces: 2,
    amenities: ['Swimming Pool', 'Gym', 'Concierge', 'Security', 'Balcony', 'Sea View'],
    nearby_facilities: ['Morocco Mall', 'Hassan II Mosque', 'Ain Diab Beach', 'Casablanca Finance City'],
    construction_year: 2020,
    monthly_rent: 15000,
    maintenance_cost: 12000,
    property_tax: 8500,
    management_fee: 5,
    total_investors: 47,
    shares_available: 250,
    total_shares: 1000,
    price_per_share: 2500
  },
  
  {
    title: 'Traditional Riad in Marrakech Medina',
    description: 'Authentic 18th-century riad completely renovated with traditional Moroccan architecture. Features beautiful courtyard, rooftop terrace with Atlas Mountains views, and 6 guest rooms perfect for boutique hotel operation.',
    location: 'Medina, Marrakech',
    city: 'Marrakech',
    region: 'Marrakech-Safi',
    price: 3200000, // 3.2M MAD
    image_url: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg',
    images: [
      'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg',
      'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg',
      'https://images.pexels.com/photos/1134188/pexels-photo-1134188.jpeg'
    ],
    min_investment: 50000,
    target_amount: 3200000,
    total_raised: 2240000,
    expected_roi: 15.8,
    rental_yield: 11.5,
    investment_period: 72,
    status: PropertyStatus.FUNDING,
    funding_deadline: '2026-04-30T23:59:59Z',
    property_type: PropertyType.HOSPITALITY,
    size_sqm: 450,
    bedrooms: 6,
    bathrooms: 6,
    floors: 3,
    parking_spaces: 0,
    amenities: ['Traditional Architecture', 'Courtyard', 'Rooftop Terrace', 'Mountain Views', 'Fountain', 'Traditional Tiles'],
    nearby_facilities: ['Jemaa el-Fnaa', 'Bahia Palace', 'Saadian Tombs', 'Majorelle Garden'],
    construction_year: 2000,
    renovation_year: 2023,
    monthly_rent: 28000,
    maintenance_cost: 25000,
    property_tax: 15000,
    management_fee: 8,
    total_investors: 32,
    shares_available: 480,
    total_shares: 1600,
    price_per_share: 2000
  },

  {
    title: 'Modern Office Building in Rabat Business District',
    description: 'Grade A office building in the heart of Rabat\'s business district. 8 floors with modern amenities, high-speed elevators, and flexible office spaces. Fully leased to government agencies and multinational corporations.',
    location: 'Agdal, Rabat',
    city: 'Rabat',
    region: 'Rabat-Salé-Kénitra',
    price: 4800000, // 4.8M MAD
    image_url: 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg',
    images: [
      'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg',
      'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg',
      'https://images.pexels.com/photos/416320/pexels-photo-416320.jpeg'
    ],
    min_investment: 100000,
    target_amount: 4800000,
    total_raised: 4800000,
    expected_roi: 10.2,
    rental_yield: 7.8,
    investment_period: 84,
    status: PropertyStatus.FUNDED,
    funding_deadline: '2025-12-31T23:59:59Z',
    property_type: PropertyType.COMMERCIAL,
    size_sqm: 2400,
    bedrooms: 0,
    bathrooms: 16,
    floors: 8,
    parking_spaces: 50,
    amenities: ['High-Speed Elevators', 'Central AC', 'Security System', 'Parking Garage', 'Conference Rooms', 'Fiber Internet'],
    nearby_facilities: ['Parliament', 'Ministry Buildings', 'Rabat Ville Train Station', 'Mohammed V University'],
    construction_year: 2018,
    monthly_rent: 35000,
    maintenance_cost: 18000,
    property_tax: 22000,
    management_fee: 6,
    total_investors: 48,
    shares_available: 0,
    total_shares: 2400,
    price_per_share: 2000
  },

  {
    title: 'Beachfront Villa in Agadir',
    description: 'Stunning 5-bedroom villa directly on Agadir beach with private access. Modern architecture with panoramic ocean views, infinity pool, and landscaped gardens. Perfect for luxury vacation rentals.',
    location: 'Baie des Palmiers, Agadir',
    city: 'Agadir',
    region: 'Souss-Massa',
    price: 5500000, // 5.5M MAD
    image_url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
    images: [
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
      'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg',
      'https://images.pexels.com/photos/1396119/pexels-photo-1396119.jpeg'
    ],
    min_investment: 50000,
    target_amount: 5500000,
    total_raised: 1650000,
    expected_roi: 14.5,
    rental_yield: 9.8,
    investment_period: 60,
    status: PropertyStatus.ACTIVE,
    funding_deadline: '2026-06-30T23:59:59Z',
    property_type: PropertyType.RESIDENTIAL,
    size_sqm: 650,
    bedrooms: 5,
    bathrooms: 4,
    floors: 2,
    parking_spaces: 3,
    amenities: ['Private Beach Access', 'Infinity Pool', 'Garden', 'Ocean Views', 'Terrace', 'BBQ Area'],
    nearby_facilities: ['Agadir Beach', 'Souk El Had', 'Agadir Marina', 'Golf Courses'],
    construction_year: 2021,
    monthly_rent: 45000,
    maintenance_cost: 35000,
    property_tax: 28000,
    management_fee: 7,
    total_investors: 18,
    shares_available: 1540,
    total_shares: 2200,
    price_per_share: 2500
  },

  {
    title: 'Shopping Center in Tangier',
    description: 'Modern shopping center with 45 retail units, food court, and cinema. Located in the expanding Tangier business district with high foot traffic and established tenant mix including international brands.',
    location: 'City Center, Tangier',
    city: 'Tangier',
    region: 'Tanger-Tétouan-Al Hoceïma',
    price: 8200000, // 8.2M MAD
    image_url: 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg',
    images: [
      'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg',
      'https://images.pexels.com/photos/1005417/pexels-photo-1005417.jpeg',
      'https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg'
    ],
    min_investment: 75000,
    target_amount: 8200000,
    total_raised: 6560000,
    expected_roi: 11.8,
    rental_yield: 8.5,
    investment_period: 96,
    status: PropertyStatus.FUNDING,
    funding_deadline: '2026-05-15T23:59:59Z',
    property_type: PropertyType.COMMERCIAL,
    size_sqm: 4500,
    bedrooms: 0,
    bathrooms: 20,
    floors: 3,
    parking_spaces: 200,
    amenities: ['Food Court', 'Cinema', 'Parking Garage', 'Security', 'Central AC', 'Escalators'],
    nearby_facilities: ['Tangier Med Port', 'Ibn Battuta Airport', 'Grand Socco', 'Kasbah'],
    construction_year: 2019,
    monthly_rent: 65000,
    maintenance_cost: 45000,
    property_tax: 38000,
    management_fee: 8,
    total_investors: 67,
    shares_available: 656,
    total_shares: 3280,
    price_per_share: 2500
  },

  {
    title: 'Residential Complex in Fes',
    description: 'Modern residential complex with 24 apartments in the new city of Fes. Family-friendly development with playground, gardens, and 24/7 security. High rental demand from young professionals and families.',
    location: 'Ville Nouvelle, Fes',
    city: 'Fes',
    region: 'Fès-Meknès',
    price: 3600000, // 3.6M MAD
    image_url: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg',
    images: [
      'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg',
      'https://images.pexels.com/photos/1396119/pexels-photo-1396119.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
    ],
    min_investment: 30000,
    target_amount: 3600000,
    total_raised: 2520000,
    expected_roi: 13.2,
    rental_yield: 9.1,
    investment_period: 72,
    status: PropertyStatus.FUNDING,
    funding_deadline: '2026-07-31T23:59:59Z',
    property_type: PropertyType.RESIDENTIAL,
    size_sqm: 1800,
    bedrooms: 48,
    bathrooms: 48,
    floors: 4,
    parking_spaces: 30,
    amenities: ['Playground', 'Gardens', '24/7 Security', 'Elevator', 'Parking', 'Storage'],
    nearby_facilities: ['University Sidi Mohamed Ben Abdellah', 'Fes Medina', 'Shopping Centers', 'Hospitals'],
    construction_year: 2022,
    monthly_rent: 28000,
    maintenance_cost: 22000,
    property_tax: 16000,
    management_fee: 6,
    total_investors: 42,
    shares_available: 540,
    total_shares: 1800,
    price_per_share: 2000
  },

  {
    title: 'Industrial Warehouse in Kenitra',
    description: 'Large industrial warehouse facility with loading docks, office space, and strategic location near Kenitra port. Fully leased to logistics companies with long-term contracts.',
    location: 'Industrial Zone, Kenitra',
    city: 'Kenitra',
    region: 'Rabat-Salé-Kénitra',
    price: 2800000, // 2.8M MAD
    image_url: 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg',
    images: [
      'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg',
      'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
      'https://images.pexels.com/photos/1267330/pexels-photo-1267330.jpeg'
    ],
    min_investment: 40000,
    target_amount: 2800000,
    total_raised: 2800000,
    expected_roi: 9.5,
    rental_yield: 7.2,
    investment_period: 120,
    status: PropertyStatus.FUNDED,
    funding_deadline: '2026-11-30T23:59:59Z',
    property_type: PropertyType.INDUSTRIAL,
    size_sqm: 3200,
    bedrooms: 0,
    bathrooms: 6,
    floors: 1,
    parking_spaces: 20,
    amenities: ['Loading Docks', 'Office Space', 'High Ceilings', 'Security', 'Truck Access', 'Storage'],
    nearby_facilities: ['Kenitra Port', 'Highway Access', 'Railway Station', 'Industrial Zone'],
    construction_year: 2017,
    monthly_rent: 18000,
    maintenance_cost: 12000,
    property_tax: 14000,
    management_fee: 5,
    total_investors: 35,
    shares_available: 0,
    total_shares: 1400,
    price_per_share: 2000
  },

  {
    title: 'Luxury Hotel in Ouarzazate',
    description: 'Boutique hotel with 30 rooms in the gateway to the Sahara Desert. Traditional Berber architecture with modern amenities. Popular with tourists visiting film studios and desert excursions.',
    location: 'City Center, Ouarzazate',
    city: 'Ouarzazate',
    region: 'Drâa-Tafilalet',
    price: 4200000, // 4.2M MAD
    image_url: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
    images: [
      'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
      'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg'
    ],
    min_investment: 60000,
    target_amount: 4200000,
    total_raised: 1260000,
    expected_roi: 16.5,
    rental_yield: 12.3,
    investment_period: 84,
    status: PropertyStatus.ACTIVE,
    funding_deadline: '2026-08-31T23:59:59Z',
    property_type: PropertyType.HOSPITALITY,
    size_sqm: 2100,
    bedrooms: 30,
    bathrooms: 30,
    floors: 3,
    parking_spaces: 40,
    amenities: ['Restaurant', 'Pool', 'Spa', 'Conference Room', 'Desert Views', 'Traditional Decor'],
    nearby_facilities: ['Atlas Film Studios', 'Kasbah Taourirt', 'Desert Tours', 'Airport'],
    construction_year: 2020,
    monthly_rent: 42000,
    maintenance_cost: 28000,
    property_tax: 20000,
    management_fee: 10,
    total_investors: 15,
    shares_available: 1470,
    total_shares: 2100,
    price_per_share: 2000
  },

  {
    title: 'Mixed-Use Development in Meknes',
    description: 'Modern mixed-use building with retail spaces on ground floor and residential apartments above. Located in the historic city of Meknes with growing commercial activity.',
    location: 'Ville Nouvelle, Meknes',
    city: 'Meknes',
    region: 'Fès-Meknès',
    price: 3100000, // 3.1M MAD
    image_url: 'https://images.pexels.com/photos/1396119/pexels-photo-1396119.jpeg',
    images: [
      'https://images.pexels.com/photos/1396119/pexels-photo-1396119.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
      'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg'
    ],
    min_investment: 35000,
    target_amount: 3100000,
    total_raised: 2170000,
    expected_roi: 12.8,
    rental_yield: 8.9,
    investment_period: 72,
    status: PropertyStatus.FUNDING,
    funding_deadline: '2026-09-15T23:59:59Z',
    property_type: PropertyType.MIXED_USE,
    size_sqm: 1550,
    bedrooms: 12,
    bathrooms: 18,
    floors: 4,
    parking_spaces: 25,
    amenities: ['Retail Spaces', 'Residential Units', 'Elevator', 'Parking', 'Storage', 'Security'],
    nearby_facilities: ['Meknes Medina', 'Moulay Ismail Mausoleum', 'Bab Mansour', 'University'],
    construction_year: 2021,
    monthly_rent: 24000,
    maintenance_cost: 18000,
    property_tax: 14000,
    management_fee: 7,
    total_investors: 38,
    shares_available: 465,
    total_shares: 1550,
    price_per_share: 2000
  },

  {
    title: 'Coastal Apartment Complex in El Jadida',
    description: 'Seaside apartment complex with 18 units overlooking the Atlantic Ocean. Popular tourist destination with Portuguese heritage and beautiful beaches. Strong vacation rental market.',
    location: 'Mazagan Beach, El Jadida',
    city: 'El Jadida',
    region: 'Casablanca-Settat',
    price: 2700000, // 2.7M MAD
    image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg',
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'
    ],
    min_investment: 25000,
    target_amount: 2700000,
    total_raised: 1890000,
    expected_roi: 13.5,
    rental_yield: 9.5,
    investment_period: 60,
    status: PropertyStatus.FUNDING,
    funding_deadline: '2026-10-31T23:59:59Z',
    property_type: PropertyType.RESIDENTIAL,
    size_sqm: 1350,
    bedrooms: 36,
    bathrooms: 36,
    floors: 3,
    parking_spaces: 20,
    amenities: ['Ocean Views', 'Beach Access', 'Pool', 'Gardens', 'Parking', 'Security'],
    nearby_facilities: ['Portuguese City', 'Mazagan Beach Resort', 'Golf Course', 'Historic Sites'],
    construction_year: 2019,
    monthly_rent: 22000,
    maintenance_cost: 16000,
    property_tax: 12000,
    management_fee: 6,
    total_investors: 34,
    shares_available: 405,
    total_shares: 1350,
    price_per_share: 2000
  },

  {
    title: 'Agricultural Land in Beni Mellal',
    description: 'Prime agricultural land with olive groves and citrus orchards. Includes modern irrigation system and processing facility. Established contracts with local cooperatives and export companies.',
    location: 'Tadla Plain, Beni Mellal',
    city: 'Beni Mellal',
    region: 'Béni Mellal-Khénifra',
    price: 1800000, // 1.8M MAD
    image_url: 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg',
    images: [
      'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg',
      'https://images.pexels.com/photos/1595108/pexels-photo-1595108.jpeg',
      'https://images.pexels.com/photos/1595110/pexels-photo-1595110.jpeg'
    ],
    min_investment: 20000,
    target_amount: 1800000,
    total_raised: 1440000,
    expected_roi: 11.2,
    rental_yield: 8.8,
    investment_period: 96,
    status: PropertyStatus.FUNDING,
    funding_deadline: '2026-11-30T23:59:59Z',
    property_type: PropertyType.LAND,
    size_sqm: 50000,
    bedrooms: 0,
    bathrooms: 2,
    floors: 1,
    parking_spaces: 5,
    amenities: ['Irrigation System', 'Processing Facility', 'Storage', 'Equipment', 'Water Rights', 'Organic Certification'],
    nearby_facilities: ['Bin el Ouidane Dam', 'Agricultural Cooperatives', 'Processing Plants', 'Transport Links'],
    construction_year: 2015,
    monthly_rent: 14000,
    maintenance_cost: 8000,
    property_tax: 6000,
    management_fee: 4,
    total_investors: 28,
    shares_available: 180,
    total_shares: 900,
    price_per_share: 2000
  },

  {
    title: 'Student Housing in Oujda',
    description: 'Purpose-built student accommodation near Mohammed Premier University. 60 studio apartments with modern amenities, study areas, and recreational facilities. High occupancy rates guaranteed.',
    location: 'University District, Oujda',
    city: 'Oujda',
    region: 'Oriental',
    price: 2400000, // 2.4M MAD
    image_url: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg',
    images: [
      'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg',
      'https://images.pexels.com/photos/1396119/pexels-photo-1396119.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
    ],
    min_investment: 20000,
    target_amount: 2400000,
    total_raised: 1680000,
    expected_roi: 14.2,
    rental_yield: 10.5,
    investment_period: 72,
    status: PropertyStatus.FUNDING,
    funding_deadline: '2026-12-31T23:59:59Z',
    property_type: PropertyType.RESIDENTIAL,
    size_sqm: 2400,
    bedrooms: 60,
    bathrooms: 60,
    floors: 5,
    parking_spaces: 15,
    amenities: ['Study Areas', 'Common Room', 'Laundry', 'Internet', 'Security', 'Gym'],
    nearby_facilities: ['Mohammed Premier University', 'Library', 'Shopping Center', 'Public Transport'],
    construction_year: 2020,
    monthly_rent: 24000,
    maintenance_cost: 15000,
    property_tax: 10000,
    management_fee: 8,
    total_investors: 42,
    shares_available: 360,
    total_shares: 1200,
    price_per_share: 2000
  },

  {
    title: 'Luxury Resort in Essaouira',
    description: 'Boutique beachfront resort with 25 suites and villas. Traditional Moroccan architecture with modern luxury amenities. Located on the famous Essaouira beach with windsurfing and cultural attractions.',
    location: 'Essaouira Beach, Essaouira',
    city: 'Essaouira',
    region: 'Marrakech-Safi',
    price: 6800000, // 6.8M MAD
    image_url: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
    images: [
      'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
      'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg'
    ],
    min_investment: 80000,
    target_amount: 6800000,
    total_raised: 2040000,
    expected_roi: 17.2,
    rental_yield: 13.8,
    investment_period: 84,
    status: PropertyStatus.ACTIVE,
    funding_deadline: '2026-01-31T23:59:59Z',
    property_type: PropertyType.HOSPITALITY,
    size_sqm: 3400,
    bedrooms: 25,
    bathrooms: 25,
    floors: 2,
    parking_spaces: 30,
    amenities: ['Private Beach', 'Spa', 'Restaurant', 'Pool', 'Water Sports', 'Traditional Architecture'],
    nearby_facilities: ['Essaouira Medina', 'Skala de la Ville', 'Port', 'Art Galleries'],
    construction_year: 2022,
    monthly_rent: 85000,
    maintenance_cost: 45000,
    property_tax: 32000,
    management_fee: 12,
    total_investors: 18,
    shares_available: 2380,
    total_shares: 3400,
    price_per_share: 2000
  },

  {
    title: 'Tech Park Office Complex in Mohammedia',
    description: 'Modern office complex designed for technology companies. Features high-speed internet infrastructure, flexible workspaces, and green building certification. Located in the emerging tech hub of Mohammedia.',
    location: 'Tech Park, Mohammedia',
    city: 'Mohammedia',
    region: 'Casablanca-Settat',
    price: 3800000, // 3.8M MAD
    image_url: 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg',
    images: [
      'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg',
      'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg',
      'https://images.pexels.com/photos/416320/pexels-photo-416320.jpeg'
    ],
    min_investment: 45000,
    target_amount: 3800000,
    total_raised: 1140000,
    expected_roi: 12.8,
    rental_yield: 9.2,
    investment_period: 84,
    status: PropertyStatus.ACTIVE,
    funding_deadline: '2026-02-28T23:59:59Z',
    property_type: PropertyType.COMMERCIAL,
    size_sqm: 1900,
    bedrooms: 0,
    bathrooms: 12,
    floors: 6,
    parking_spaces: 80,
    amenities: ['High-Speed Internet', 'Flexible Spaces', 'Green Certification', 'Conference Rooms', 'Cafeteria', 'Parking'],
    nearby_facilities: ['Casablanca', 'Mohammed V Airport', 'Port of Mohammedia', 'Universities'],
    construction_year: 2023,
    monthly_rent: 32000,
    maintenance_cost: 20000,
    property_tax: 18000,
    management_fee: 7,
    total_investors: 12,
    shares_available: 1330,
    total_shares: 1900,
    price_per_share: 2000
  },

  {
    title: 'Mountain Resort in Ifrane',
    description: 'Alpine-style resort in the "Switzerland of Morocco". 40 chalets and hotel rooms with ski facilities, conference center, and year-round activities. Popular for winter sports and summer retreats.',
    location: 'Michlifen, Ifrane',
    city: 'Ifrane',
    region: 'Fès-Meknès',
    price: 7200000, // 7.2M MAD
    image_url: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
    images: [
      'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
      'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg'
    ],
    min_investment: 100000,
    target_amount: 7200000,
    total_raised: 2160000,
    expected_roi: 15.5,
    rental_yield: 11.8,
    investment_period: 96,
    status: PropertyStatus.ACTIVE,
    funding_deadline: '2026-03-31T23:59:59Z',
    property_type: PropertyType.HOSPITALITY,
    size_sqm: 4800,
    bedrooms: 40,
    bathrooms: 40,
    floors: 3,
    parking_spaces: 100,
    amenities: ['Ski Facilities', 'Conference Center', 'Restaurant', 'Spa', 'Alpine Architecture', 'Mountain Views'],
    nearby_facilities: ['Al Akhawayn University', 'Michlifen Ski Resort', 'Cedar Forests', 'National Park'],
    construction_year: 2021,
    monthly_rent: 78000,
    maintenance_cost: 55000,
    property_tax: 35000,
    management_fee: 10,
    total_investors: 15,
    shares_available: 2640,
    total_shares: 3600,
    price_per_share: 2000
  }
];

// Function to seed the database with sample properties
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Note: This would typically use the PropertyService.createProperty method
    // For now, we're just providing the seed data structure
    
    console.log(`Prepared ${seedProperties.length} properties for seeding`);
    console.log('Properties by city:');
    
    const cityCounts = seedProperties.reduce((acc, prop) => {
      acc[prop.city] = (acc[prop.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(cityCounts).forEach(([city, count]) => {
      console.log(`  ${city}: ${count} properties`);
    });
    
    console.log('Properties by type:');
    const typeCounts = seedProperties.reduce((acc, prop) => {
      acc[prop.property_type] = (acc[prop.property_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} properties`);
    });
    
    const totalValue = seedProperties.reduce((sum, prop) => sum + prop.price, 0);
    const totalRaised = seedProperties.reduce((sum, prop) => sum + prop.total_raised, 0);
    const avgROI = seedProperties.reduce((sum, prop) => sum + prop.expected_roi, 0) / seedProperties.length;
    
    console.log(`Total property value: ${totalValue.toLocaleString()} MAD`);
    console.log(`Total amount raised: ${totalRaised.toLocaleString()} MAD`);
    console.log(`Average expected ROI: ${avgROI.toFixed(1)}%`);
    
    return {
      success: true,
      message: 'Seed data prepared successfully',
      data: {
        properties: seedProperties.length,
        totalValue,
        totalRaised,
        avgROI
      }
    };
    
  } catch (error) {
    console.error('Error preparing seed data:', error);
    return {
      success: false,
      error: 'Failed to prepare seed data',
      message: 'An error occurred while preparing the seed data'
    };
  }
};

// Export individual property data for testing
export const getPropertyById = (id: string) => {
  return seedProperties.find(prop => prop.id === id);
};

export const getPropertiesByCity = (city: string) => {
  return seedProperties.filter(prop => prop.city.toLowerCase() === city.toLowerCase());
};

export const getPropertiesByType = (type: PropertyType) => {
  return seedProperties.filter(prop => prop.property_type === type);
};

export const getPropertiesByStatus = (status: PropertyStatus) => {
  return seedProperties.filter(prop => prop.status === status);
};