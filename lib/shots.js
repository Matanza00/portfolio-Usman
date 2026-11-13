// Helpers for case-study screenshots: which ones are phone captures, and a
// readable name for each one, taken from its file name.

export const isPhone = (src) => /karighar|ifund|garagepal\/mobile|m-home/.test(src);

const LABEL = {
  lib: "Library", ad: "Ad detail", boards: "Boards", req: "Ad requests", admin: "Admin overview", manage: "Manage ads", ana: "Analytics",
  dash: "Dashboard", track: "Live tracking", veh: "Vehicles", drv: "Drivers", fuel: "Fuel", mnt: "Maintenance", ins: "Emergency and insurance", roles: "Users and roles",
  cmp: "Complaints", jobs: "Job slips", ten: "Tenants and occupancy", plant: "Plant room", duty: "Janitorial duty", sec: "Security and CCTV", users: "Users and access",
  garage: "Garage profile", emp: "Employees", cust: "Customers", book: "Booking", appt: "Appointments", msg: "Messages", home: "Home", map: "Map", pay: "Payment",
  chat: "Chat", bookings: "Bookings", rate: "Rate the job", profile: "Profile", splash: "Launch", signin: "Sign in", signup: "Choose a side",
  leads: "Leads pipeline", filters: "Filters", matches: "Scored matches", settings: "Security and plan", hero: "Home", creatine: "Creatine scene",
  stack: "Growth Stack scene", products: "Products", certificates: "Certificates", whey: "Whey protein", dashboard: "Dashboard", marketplace: "Marketplace",
  preview: "Lead preview", grid: "Grid view", plans: "Plans", upgrade: "Billing", s01: "Hero", s03: "Brands", s05: "Client results",
  s06: "One ad, six decisions", s07: "The decisions", s08: "The loop", s09: "Obyect library", s10: "Comparison",
};

export const labelOf = (src) => {
  const base = src.split("/").pop().replace(/\.\w+$/, "");
  if (base === "m-home") return "Home on a phone";
  const key = base.replace(/^\d+-/, "");
  return LABEL[key] || key.replace(/-/g, " ");
};

export const platformLabel = (c) =>
  c.platform === "mobile" ? "iOS and Android" : c.platform === "both" ? "Mobile app and web" : "Web";
