// Every project has its own accent colour, its own particle shape in the
// background field, and its own showcase component (see components/showcase).
// Feature lists describe what each product actually does.

const ALL = [
  {
    slug: "karighar",
    name: "Karighar",
    kind: "Home-services booking app",
    role: "Design and front-end. A ground-up redesign, built as an interactive prototype.",
    year: "2026",
    accent: "#1f9d72",
    shape: "orb",
    summary:
      "A redesign of a Karachi home-services app: book a CNIC-verified plumber, electrician or AC technician, watch them arrive on a live map, and pay cash on completion. A calm sage system with one saffron action per screen.",
    stack: ["HTML", "CSS", "JavaScript", "Interactive prototype", "Light and dark"],
    live: null,
    domain: null,
    // scroll-scrubbed through the phone, one step per screen
    screens: [
      { src: "/work/karighar/01-home.png", label: "Home", line: "Services, your live job, and top-rated pros near you in Karachi." },
      { src: "/work/karighar/02-book.png", label: "Book", line: "Pick a service and a verified pro, with one clear action per screen." },
      { src: "/work/karighar/03-map.png", label: "Nearby pros", line: "A live map of verified pros around you, by distance and rating." },
      { src: "/work/karighar/04-track.png", label: "Live tracking", line: "Watch your pro approach in real time, the way a ride app works." },
      { src: "/work/karighar/05-pay.png", label: "Payment", line: "A cash-first checkout with a clear breakdown before you confirm." },
      { src: "/work/karighar/06-rate.png", label: "Rate", line: "Rate the pro and the job the moment it's done." },
      { src: "/work/karighar/07-bookings.png", label: "Bookings", line: "Every past and upcoming job in one place." },
      { src: "/work/karighar/08-profile.png", label: "Profile", line: "Addresses, payment and account settings." },
    ],
    features: [
      {
        title: "Booking flow",
        items: [
          "Browse services with live pricing, from plumbing and electrical to AC repair.",
          "CNIC-verified pros with ratings and job counts.",
          "One saffron action per screen, so the next step is never in doubt.",
        ],
      },
      {
        title: "Live tracking",
        items: [
          "A live map of nearby pros, ranked by distance and rating.",
          "Track your pro's arrival in real time once a job is confirmed.",
        ],
      },
      {
        title: "After the job",
        items: [
          "Cash-first checkout with a clear breakdown before confirming.",
          "Rate the pro and the job, then see it in a full bookings history.",
          "Profile with saved addresses, payment and settings.",
        ],
      },
      {
        title: "Design system",
        items: [
          "A sage ground with white cards, forest-green identity and a single saffron action colour.",
          "Built as a clickable 390x844 prototype with full light and dark themes.",
        ],
      },
    ],
  },
  {
    slug: "obyect",
    name: "Obyect",
    kind: "AI ad-insights platform",
    role: "Full-stack developer",
    year: "2025",
    accent: "#6aa0ff",
    shape: "shelf",
    summary:
      "An AI-powered ad-insights platform, a transparent Meta Ads Library for DTC brands. Browse only top-performing static ads that have run 30+ days, hand-curated by strategists, request new creative, and manage it all from an admin side.",
    stack: ["React", "Next.js", "Supabase", "Node.js", "AI analytics"],
    live: "https://obyect.io",
    domain: "obyect.io",
    screens: [
      { src: "/work/obyect/web/01-lib.jpg", label: "Library", line: "2,400+ hand-curated DTC ads, only winners running 30+ days, filterable by brand, category and hook." },
      { src: "/work/obyect/web/02-ad.jpg", label: "Ad detail", line: "Open any ad for its creative DNA: persona, hook, format and why it performs." },
      { src: "/work/obyect/web/03-boards.jpg", label: "Boards", line: "Save ads into swipe files and boards for the next brief." },
      { src: "/work/obyect/web/04-req.jpg", label: "Ad requests", line: "Request new creative from the Subyect design team without leaving the app." },
      { src: "/work/obyect/web/05-admin.jpg", label: "Admin overview", line: "A dashboard for the curation team behind the library." },
      { src: "/work/obyect/web/06-manage.jpg", label: "Manage ads", line: "Add, tag and curate every ad in the library." },
      { src: "/work/obyect/web/07-ana.jpg", label: "Analytics", line: "Usage and performance analytics across the whole library." },
    ],
    features: [
      {
        title: "The library",
        items: [
          "A curated feed of top-performing static ads from 50+ leading DTC brands.",
          "Only ads that have been running 30+ days, chosen by creative strategists.",
          "Filter by brand and category; save ads to personal boards.",
        ],
      },
      {
        title: "For teams",
        items: [
          "Built for founders, creative strategists, designers and media buyers.",
          "Request new creative from the Subyect agency without leaving the app.",
        ],
      },
      {
        title: "Admin and analytics",
        items: [
          "An admin dashboard to add, tag and manage every ad.",
          "Usage and performance analytics across the library.",
        ],
      },
      {
        title: "Under the hood",
        items: [
          "React front end on a Supabase and Node.js backend.",
          "AI-assisted data analysis to surface what is working.",
        ],
      },
    ],
  },
  {
    slug: "zestlead",
    name: "ZestLead",
    kind: "Real-estate lead marketplace",
    role: "Full-stack developer",
    year: "2025",
    accent: "#13b0a5",
    shape: "bars",
    summary:
      "A real-estate lead marketplace where agents discover, buy and manage high-quality property leads in one portal. Powerful filters, AI-driven insights, audio previews and Stripe subscriptions streamline qualification and outreach.",
    stack: ["Next.js", "React", "Stripe", "Automation", "Admin panel"],
    live: null,
    domain: null,
    screens: [
      { src: "/work/zestlead/01-dashboard.png", label: "Dashboard", line: "Leads, deals closed and revenue generated at a glance." },
      { src: "/work/zestlead/02-marketplace.png", label: "Marketplace", line: "Browse available property leads as a filterable list." },
      { src: "/work/zestlead/03-preview.png", label: "Lead preview", line: "Preview a lead, with an audio snippet, before you buy." },
      { src: "/work/zestlead/04-grid.png", label: "Grid view", line: "The same marketplace as a scannable visual grid." },
      { src: "/work/zestlead/05-plans.png", label: "Plans", line: "Subscription tiers for every kind of agent." },
      { src: "/work/zestlead/06-upgrade.png", label: "Billing", line: "Upgrade and manage billing through Stripe." },
    ],
    features: [
      {
        title: "Lead marketplace",
        items: [
          "Discover and buy property leads in list or grid view.",
          "Powerful filters plus AI-driven insights to qualify faster.",
          "Audio previews so agents can vet a lead before buying.",
        ],
      },
      {
        title: "For agents",
        items: [
          "A dashboard tracking new, purchased and contacted leads.",
          "Deals closed, revenue generated and recent activity in one view.",
          "A wallet and credits system for buying leads.",
        ],
      },
      {
        title: "Subscriptions and billing",
        items: [
          "Tiered plans with Stripe-powered subscription and billing.",
          "Upgrade, downgrade and top up credits in-app.",
        ],
      },
      {
        title: "Admin",
        items: [
          "An admin panel to manage leads, agents and plans.",
          "Automations that keep the marketplace and outreach moving.",
        ],
      },
    ],
  },
  {
    slug: "ifund",
    name: "iFund",
    kind: "Funding marketplace app",
    role: "Developer, Legit Design Studio",
    year: "2026",
    accent: "#35d6a0",
    shape: "crescent",
    summary:
      "A two-sided marketplace for property and business funding, built at Legit Design Studio. Borrowers post what they need, every lender match is scored, and both sides talk and close inside the app, on iOS and Android.",
    stack: ["React Native", "Expo", "TypeScript", "Supabase", "TanStack Query", "RevenueCat"],
    live: "https://www.ifund.realestate",
    domain: "ifund.realestate",
    screens: [
      { src: "/work/ifund/app/01-splash.jpg", label: "Launch", line: "Intelligent funding for real estate, on iOS and Android." },
      { src: "/work/ifund/app/02-signin.jpg", label: "Sign in", line: "Email and password, or one tap with Google or Apple." },
      { src: "/work/ifund/app/03-signup.jpg", label: "Choose a side", line: "One account form for both roles: lender or borrower." },
      { src: "/work/ifund/app/05-leads.jpg", label: "Leads pipeline", line: "Every lead by stage, from first match to funded." },
      { src: "/work/ifund/app/06-filters.jpg", label: "Filter leads", line: "By location, amount, date posted and funding type." },
      { src: "/work/ifund/app/07-matches.jpg", label: "Scored matches", line: "Each request carries a match score, so the strongest leads come first." },
      { src: "/work/ifund/app/09-settings.jpg", label: "Security and plan", line: "Face ID, two-factor sign-in, login activity and subscription billing." },
    ],
    features: [
      {
        title: "Accounts and security",
        items: [
          "Sign-up with a lender or borrower role, email verification and password reset.",
          "Google and Apple sign-in.",
          "Face ID unlock, two-factor authentication and a login-activity log.",
        ],
      },
      {
        title: "Borrower and lender flows",
        items: [
          "Three-step onboarding and a funding-request form: purpose, amount, property and timeline.",
          "Scored lender matches with filters, profiles, reviews and verification badges.",
          "A lender dashboard with exposures, match score, enquiries and a real-time leads pipeline.",
        ],
      },
      {
        title: "Plans and messaging",
        items: [
          "Starter, Professional and Elite plans with in-app purchase and billing.",
          "In-app chat with attachments, presence and unread counts.",
          "Push notifications with instant, daily or weekly preferences.",
        ],
      },
    ],
  },
  {
    slug: "atomic-muscles",
    name: "Atomic Muscles",
    kind: "3D e-commerce store",
    role: "Full-stack / front-end developer",
    year: "2026",
    accent: "#ee7118",
    shape: "stack",
    summary:
      "A scroll-driven store for a Pakistani supplement brand: three pinned video scenes with a three.js particle layer, 3D product viewers, bundle pricing, Shopify checkout and an English/Urdu toggle.",
    stack: ["Vite", "JavaScript", "Three.js", "Shopify checkout", "English + Urdu"],
    live: "https://atomicmuscles.com",
    domain: "atomicmuscles.com",
    screens: [
      { src: "/work/atomic-muscles/01-hero.jpg", label: "Home" },
      { src: "/work/atomic-muscles/02-creatine.jpg", label: "Creatine scene" },
      { src: "/work/atomic-muscles/03-stack.jpg", label: "Growth Stack scene" },
      { src: "/work/atomic-muscles/04-products.jpg", label: "Products" },
      { src: "/work/atomic-muscles/05-certificates.jpg", label: "Certificates" },
      { src: "/work/atomic-muscles/06-whey.jpg", label: "Whey Protein" },
    ],
    mobile: "/work/atomic-muscles/m-home.jpg",
    features: [
      {
        title: "Storefront",
        items: [
          "Product pages for whey protein and creatine with flavour and size options.",
          "A Growth Stack bundle and bulk-purchase discounts.",
          "Nutrition facts, hero stats and supplement details on every product.",
        ],
      },
      {
        title: "3D product experience",
        items: [
          "Interactive 3D renders of the product tubs with Three.js.",
          "A bold, dark storefront built for a supplement brand.",
        ],
      },
      {
        title: "Trust and conversion",
        items: [
          "Certification badges, authenticity verification and an FAQ.",
          "Customer testimonials from cities across Pakistan.",
        ],
      },
      {
        title: "Checkout and support",
        items: [
          "Cart and checkout with free nationwide shipping.",
          "WhatsApp support and clear refund, privacy and shipping policies.",
        ],
      },
    ],
  },
  {
    slug: "subyect",
    name: "Subyect",
    kind: "Creative agency site",
    role: "Front-end developer",
    year: "2025",
    accent: "#a98bf0",
    shape: "helix",
    summary:
      "The marketing site for Subyect, a static-ad creative agency for DTC brands spending €100K+ a month on ads. A scroll-driven story of their method, their results and their in-house ad-intelligence library, Obyect.",
    stack: ["Next.js", "React", "Tailwind CSS", "Framer Motion"],
    live: "https://www.subyect.com",
    domain: "subyect.com",
    screens: [
      { src: "/work/subyect/s01.jpg", label: "Home", line: "The hero: the agency designs the decisions a DTC ad account runs on." },
      { src: "/work/subyect/s05.jpg", label: "Results", line: "Case studies: millions in revenue from static ads for Eclat, Mobile Vikings and more." },
      { src: "/work/subyect/s07.jpg", label: "Method", line: "Every ad starts from six decisions: persona, trigger, awareness, format and angle." },
      { src: "/work/subyect/s09.jpg", label: "Obyect library", line: "An in-house library of proven DTC winners, wired into every concept." },
    ],
    features: [
      {
        title: "The story",
        items: [
          "A scroll-driven narrative for DTC brands spending €100K+ a month on ads.",
          "Animated hero, stats and testimonials that build trust fast.",
        ],
      },
      {
        title: "Method",
        items: [
          "The six-decision framework behind every ad: persona, trigger, awareness, format and angle.",
          "A clear, visual explanation of the agency's process.",
        ],
      },
      {
        title: "Proof",
        items: [
          "Client case studies: Eclat, Mobile Vikings, Hears, BlocOut and more.",
          "100+ brands, 30K+ ads designed and €20M+ in tracked client revenue.",
        ],
      },
      {
        title: "Obyect library",
        items: [
          "Showcases the in-house Obyect ad-intelligence library.",
          "Ties the agency's creative engine to a real product.",
        ],
      },
    ],
  },
  {
    slug: "fleet",
    name: "Fleet Management System",
    kind: "National fleet platform",
    role: "Lead front-end developer, SOS Globals",
    year: "2024",
    accent: "#38bdf8",
    shape: "network",
    summary:
      "A national fleet-management system for 580+ vehicles across 12+ cities in Pakistan: live tracking, driver, fuel, vehicle, insurance and emergency modules, with role-based access for regional heads, supervisors, technicians and drivers.",
    stack: ["React", "Next.js", "Node.js", "MySQL", "Prisma", "Tailwind CSS"],
    live: null,
    domain: null,
    screens: [
      { src: "/work/fleet/web/01-dash.jpg", label: "Dashboard", line: "Vehicles on the road, fuel, economy and open maintenance, with live alerts in one view." },
      { src: "/work/fleet/web/02-track.jpg", label: "Live tracking", line: "Every vehicle on a live map, filterable by moving, idle, workshop or parked." },
      { src: "/work/fleet/web/03-veh.jpg", label: "Vehicles", line: "The fleet register: plates, status, odometer and assignments." },
      { src: "/work/fleet/web/04-drv.jpg", label: "Drivers", line: "Driver profiles, licences, scores and current assignments." },
      { src: "/work/fleet/web/05-fuel.jpg", label: "Fuel", line: "Fuel logs per vehicle with anomaly flags and cost per litre." },
      { src: "/work/fleet/web/06-mnt.jpg", label: "Maintenance", line: "Periodic and daily maintenance schedules and job history." },
      { src: "/work/fleet/web/07-ins.jpg", label: "Emergency and insurance", line: "Emergency jobs and insurance claims tracked to closure." },
      { src: "/work/fleet/web/08-roles.jpg", label: "Users and roles", line: "Role-based access for regional heads, supervisors, technicians and drivers." },
    ],
    features: [
      {
        title: "Operations",
        items: [
          "Live tracking of 580+ vehicles across 12+ cities, filterable by status.",
          "A vehicle register and driver profiles with assignments and scores.",
          "Supports 4 regional heads and separate roles for drivers, supervisors and technicians.",
        ],
      },
      {
        title: "Fuel, maintenance and incidents",
        items: [
          "Fuel logs with anomaly detection and cost tracking.",
          "Periodic and daily maintenance schedules with job history.",
          "Emergency jobs and insurance claims, tracked to closure.",
        ],
      },
      {
        title: "Analytics",
        items: [
          "Real-time analytics dashboards with AI-driven insights.",
          "Improved employee efficiency by 35% and cut fuel expenses by 38%.",
        ],
      },
      {
        title: "Under the hood",
        items: [
          "React and Next.js front end with Tailwind CSS.",
          "Node.js, MySQL and Prisma behind secure real-time APIs.",
        ],
      },
    ],
  },
  {
    slug: "facility",
    name: "Facility Management System",
    kind: "SaudiPak facility platform",
    role: "Team lead and full-stack developer, NXCSOL",
    year: "2023",
    accent: "#2bb57a",
    shape: "tower",
    summary:
      "A facility-management platform for SaudiPak: complaints, job slips, tenants and occupancy, plant-room logs, janitorial duty, security and CCTV, with role-based access for 260+ users across 6 roles.",
    stack: ["Next.js", "React", "Node.js", "MongoDB", "Tailwind CSS"],
    live: null,
    domain: null,
    screens: [
      { src: "/work/facility/web/01-dash.jpg", label: "Overview", line: "Occupancy, open complaints, job slips and staff on duty for the tower, at a glance." },
      { src: "/work/facility/web/02-cmp.jpg", label: "Complaints", line: "Tenant complaints from first response to resolution." },
      { src: "/work/facility/web/03-jobs.jpg", label: "Job slips", line: "Maintenance job slips assigned to technicians and tracked by status." },
      { src: "/work/facility/web/04-ten.jpg", label: "Tenants and occupancy", line: "Every floor, tenant and lease in one occupancy map." },
      { src: "/work/facility/web/05-plant.jpg", label: "Plant room", line: "Hourly logs for boilers, chillers and generators." },
      { src: "/work/facility/web/06-duty.jpg", label: "Janitorial and duty", line: "Daily duty rosters and attendance for janitorial staff." },
      { src: "/work/facility/web/07-sec.jpg", label: "Security and CCTV", line: "Security operations, incidents and CCTV coverage." },
      { src: "/work/facility/web/08-users.jpg", label: "Users and access", line: "Role-based access for 260+ users across 6 roles." },
    ],
    features: [
      {
        title: "Operations",
        items: [
          "Complaints and job slips from first response to resolution.",
          "Attendance, daily maintenance and security operations modules.",
          "Fleet booking for 15+ cars.",
        ],
      },
      {
        title: "Building",
        items: [
          "Tenants and occupancy by floor and lease.",
          "Plant-room logs, janitorial duty rosters and CCTV coverage.",
        ],
      },
      {
        title: "People and access",
        items: [
          "Role-based access for 260+ users across 6 roles.",
          "Custom analytics dashboards tracking technician productivity and performance trends.",
        ],
      },
      {
        title: "Under the hood",
        items: [
          "Led a 3-person team on a MERN build with a Next.js front end.",
          "Secure data storage and real-time APIs for day-to-day operations.",
        ],
      },
    ],
  },
];

// Order on the page: grouped by type (mobile, web and SaaS, custom software),
// newest first within each group. The rail and palette follow this order too.
const ORDER = [
  // mobile apps
  "karighar",
  "ifund",
  // web and SaaS
  "atomic-muscles",
  "obyect",
  "subyect",
  "zestlead",
  // custom software
  "fleet",
  "facility",
];
export const PROJECTS = ORDER.map((slug) => ALL.find((p) => p.slug === slug)).filter(Boolean);

// Newest first.
export const ALSO_SHIPPED = [
  {
    name: "EgCellent",
    line: "A ledger-based finance app for poultry farms: egg sales, feed, medicine and transport in simple actions. Supabase, React, Next.js.",
  },
  {
    name: "AI Graphic Directory",
    line: "An auto-updating directory of AI tools for designers, fed by an n8n web-scraping pipeline. Next.js, Supabase, n8n.",
    href: "https://dir.nxcsol.com",
  },
  {
    name: "GaragePal",
    line: "An auto-service marketplace connecting drivers with vetted garages across Canada and Qatar. Next.js, MySQL, Prisma, Google Maps and OAuth.",
    href: "https://garagepal.ca",
  },
  {
    name: "NXCSOL",
    line: "The marketing site for a software studio, with framer-motion and 3D animation. Next.js and Tailwind, as lead front-end developer.",
    href: "https://nxcsol.com",
  },
  {
    name: "Management Software",
    line: "An operations suite: fleet, fuel, payroll, clinic and inventory modules with role-based access. React and a Node.js backend.",
  },
];
