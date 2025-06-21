
export interface ServiceCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  services: Service[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export const escortServices: ServiceCategory[] = [
  {
    id: 'intimate',
    name: 'Intimate Experiences',
    emoji: '💞',
    description: 'Romantic and intimate companionship services',
    services: [
      {
        id: 'gfe',
        name: 'GFE – Girlfriend Experience',
        description: 'A natural, romantic experience with affection, kissing, and connection.'
      },
      {
        id: 'dinner-date',
        name: 'Dinner Date',
        description: 'Elegant companionship for fine dining and meaningful conversation.'
      },
      {
        id: 'travel-companion',
        name: 'Travel Companion',
        description: 'Discreet partners for domestic or international trips — business or pleasure.'
      },
      {
        id: 'movie-event',
        name: 'Movie or Event Escort',
        description: 'Enjoy the company of a stunning date at social events or movie nights.'
      },
      {
        id: 'sleepover',
        name: 'Sleepover',
        description: 'Overnight connection with full intimacy and comfort.'
      }
    ]
  },
  {
    id: 'sexual',
    name: 'Sexual Services',
    emoji: '🔥',
    description: 'Adult intimate services for consenting adults',
    services: [
      {
        id: 'bj-condom',
        name: 'BJ – Blowjob with Condom',
        description: 'Safe and satisfying oral pleasure.'
      },
      {
        id: 'bj-raw',
        name: 'Raw BJ – Blowjob without Condom',
        description: 'Natural oral experience (offered at the companion\'s discretion).'
      },
      {
        id: 'cim',
        name: 'CIM – Cum In Mouth',
        description: 'Ultimate oral satisfaction with a passionate finish.'
      },
      {
        id: 'cob',
        name: 'COB – Cum On Body',
        description: 'A classic, steamy finale — anywhere on the body.'
      },
      {
        id: '69',
        name: '69',
        description: 'Mutual oral pleasure, perfectly synchronized.'
      },
      {
        id: 'anal',
        name: 'Anal Sex',
        description: 'Offered selectively — for adventurous clients seeking deeper intensity.'
      },
      {
        id: 'threesome',
        name: 'Threesome (3 Some)',
        description: 'Double the pleasure with two escorts or couples experiences.'
      },
      {
        id: 'lesbian-show',
        name: 'Lesbian Show',
        description: 'Sensual, erotic performances between female companions — just for you.'
      },
      {
        id: 'rimming',
        name: 'Rimming (Giving)',
        description: 'Oral attention to the most sensitive area — pleasure beyond expectations.'
      },
      {
        id: 'mutual-masturbation',
        name: 'Mutual Masturbation',
        description: 'Intimate, slow-paced pleasure — together.'
      }
    ]
  },
  {
    id: 'kink',
    name: 'Kink & Fantasy Services',
    emoji: '🔗',
    description: 'Fantasy and fetish experiences',
    services: [
      {
        id: 'role-play',
        name: 'Role Play',
        description: 'Indulge in fantasy — be it teacher, nurse, boss, or more.'
      },
      {
        id: 'domination',
        name: 'Domination / Submission',
        description: 'Light BDSM experiences with a dominant or submissive partner.'
      },
      {
        id: 'foot-fetish',
        name: 'Foot Fetish & Worship',
        description: 'For lovers of beautiful feet — kisses, licking, and foot massages.'
      },
      {
        id: 'bondage',
        name: 'Bondage / Restraints',
        description: 'Tie-up games and soft kink experiences (by prior agreement).'
      },
      {
        id: 'golden-shower',
        name: 'Golden Shower (Giving/Receiving)',
        description: 'A rare, fetish-friendly option — available on special request.'
      },
      {
        id: 'pegging',
        name: 'Pegging',
        description: 'Role-reversal with confident and open-minded companions.'
      }
    ]
  },
  {
    id: 'massage',
    name: 'Massage & Sensual Relaxation',
    emoji: '💆',
    description: 'Relaxation and sensual massage services',
    services: [
      {
        id: 'massage',
        name: 'Massage Services',
        description: 'Relax your body and mind with soothing professional or sensual massage.'
      },
      {
        id: 'tantric',
        name: 'Tantric Massage',
        description: 'Deep, spiritual, and erotic energy exchange through touch.'
      },
      {
        id: 'nuru',
        name: 'Nuru Massage',
        description: 'Slippery, full-body massage with sensual oils and skin-to-skin contact.'
      },
      {
        id: 'oil-rub',
        name: 'Oil Body Rub',
        description: 'Smooth, slow massage that awakens every nerve.'
      },
      {
        id: 'shower-together',
        name: 'Shower Together',
        description: 'A sensual experience in the bathroom — wet, warm, and intimate.'
      }
    ]
  },
  {
    id: 'virtual',
    name: 'Virtual & Digital Services',
    emoji: '🧑‍💻',
    description: 'Online and digital intimate experiences',
    services: [
      {
        id: 'video-call',
        name: 'Video Call GFE / Sexting',
        description: 'Real-time intimacy and flirty conversations — anytime, anywhere.'
      },
      {
        id: 'virtual-strip',
        name: 'Virtual Striptease / Cam Show',
        description: 'Live, private strip shows via webcam — discreet and exciting.'
      },
      {
        id: 'custom-content',
        name: 'Custom Content (Videos / Photos)',
        description: 'Personalized adult content made just for you.'
      },
      {
        id: 'onlyfans-style',
        name: 'OnlyFans-style Experiences',
        description: 'Exclusive behind-the-scenes access to your favorite companion.'
      }
    ]
  },
  {
    id: 'premium',
    name: 'Premium & Niche Experiences',
    emoji: '💎',
    description: 'Exclusive and specialized services',
    services: [
      {
        id: 'couples',
        name: 'Couples Experience',
        description: 'Erotic sessions tailored for couples looking to spice things up.'
      },
      {
        id: 'milf',
        name: 'MILF / Mature Escorts',
        description: 'Sophisticated, experienced women who know how to please.'
      },
      {
        id: 'teen-look',
        name: 'Teen-Look Escorts (18+ Only)',
        description: 'Youthful appearance and energy — strictly legal, for those who prefer it.'
      },
      {
        id: 'orgy',
        name: 'Orgy / Group Fun',
        description: 'High-energy, multi-partner sessions — booked with advance notice.'
      },
      {
        id: 'party-companion',
        name: 'Party Companion',
        description: 'The life of the party — flirtatious, fun, and unforgettable.'
      }
    ]
  }
];

export const getAllServices = (): Service[] => {
  return escortServices.flatMap(category => category.services);
};

export const getServiceById = (id: string): Service | undefined => {
  return getAllServices().find(service => service.id === id);
};

export const getCategoryById = (id: string): ServiceCategory | undefined => {
  return escortServices.find(category => category.id === id);
};
