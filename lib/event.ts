/**
 * Single source of truth for event content.
 * Every fact here comes from the three official DTD posters. Do not add
 * details (start times, prize splits, sponsors, socials) that the organizers
 * have not confirmed.
 */

export const EVENT = {
  name: "Destroy The Decibel",
  short: "DTD",
  tagline: "The Battle of Exhausts",
  department: "Department of Computer Science & Engineering",
  college: "Vidya Academy of Science and Technology",
  /** Shown wherever the site names the location. */
  location: "Vidya Academy of Science and Technology, Thrissur",
  developer: "Rahul M J",
  /** The developer's own photo and profiles, shown in the footer credit. */
  developerPhoto: "/images/team/rahul-mj.jpg",
  developerLinks: {
    linkedin: "https://www.linkedin.com/in/rahulmj2004/",
    instagram: "https://www.instagram.com/rahul110_/",
  },
  dateLabel: "October 17, 2026",
  dateShort: "17 OCT 2026",
  /** Machine-readable event date (India Standard Time). */
  dateIso: "2026-10-17",
  prizePool: 40000,
  entryFee: 1000,
  maxEngineCc: 2000,
  finalists: 4,
  venue: {
    name: "Vidya Academy of Science and Technology",
    /** As given in the organizers' Google Maps link. */
    address: ["P.O. Thalakottukara, Kaipparambu", "Thrissur, Keralam 680601"],
    /** Keyless Google Maps embed of the college. */
    mapEmbedUrl:
      "https://www.google.com/maps?q=Vidya+Academy+of+Science+and+Technology,+Thalakottukara,+Thrissur,+Kerala+680601&z=15&output=embed",
    directionsUrl:
      "https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KQdGWA5N6qc7MS4krx3-52Qm&daddr=P.O.+Thalakottukara,,+Kaipparambu,+Thrissur,+Keralam+680601",
  },
  /** Shown beside the guest-reveal video once the organizers confirm the spelling. */
  guestName: null as string | null,
} as const;

export const NAV_LINKS = [
  { label: "About", href: "/#about" },
  { label: "The Competition", href: "/#competition" },
  { label: "Rules", href: "/rules" },
  { label: "Prizes", href: "/#prizes" },
  { label: "FAQ", href: "/#faq" },
] as const;

export type RuleCategoryId =
  | "eligibility"
  | "schedule"
  | "measurement"
  | "rounds"
  | "venue"
  | "authority";

export type Rule = {
  n: number;
  text: string;
  category: RuleCategoryId;
  /** The rule itself names disqualification as the consequence. */
  disqualification?: boolean;
};

export const RULE_CATEGORIES: { id: RuleCategoryId; title: string; caption: string }[] = [
  { id: "eligibility", title: "Entry & Vehicle Eligibility", caption: "Before you arrive" },
  { id: "schedule", title: "Reporting & Lineup", caption: "Event morning" },
  { id: "measurement", title: "Decibel Measurement", caption: "Your one minute" },
  { id: "rounds", title: "Rounds & Results", caption: "Qualifying to final" },
  { id: "venue", title: "Venue Conduct", caption: "On the premises" },
  { id: "authority", title: "Discipline & Authority", caption: "Final word" },
];

/** All 26 rules, in poster order, wording preserved. */
export const RULES: Rule[] = [
  { n: 1, category: "eligibility", disqualification: true, text: "Vehicles absent at the entry time will be disqualified immediately." },
  { n: 2, category: "eligibility", text: "Spot registration is not allowed." },
  { n: 3, category: "eligibility", text: "Spot modifications are not allowed." },
  { n: 4, category: "eligibility", text: "Cars with engine capacities up to 2000 cc are allowed." },
  { n: 5, category: "eligibility", text: "Vehicles will be thoroughly checked before the competition." },
  { n: 6, category: "eligibility", text: "The exhaust is compulsory and must be present only at the rear side of the vehicle." },
  { n: 7, category: "eligibility", text: "An end can is compulsory for all vehicles." },
  { n: 8, category: "schedule", text: "Reporting time for contestants is 7:30 AM at Thalakkottukara, Thrissur." },
  { n: 9, category: "schedule", text: "After inspection, each vehicle will be labelled with a DTD lot number." },
  { n: 10, category: "schedule", text: "All vehicles must be present during the lineup (9:00 AM–9:30 AM) and entry rally (9:30 AM–10:00 AM)." },
  { n: 11, category: "measurement", text: "Participation time for each vehicle is a maximum of one minute. There will be no second chances." },
  { n: 12, category: "measurement", text: "During the competition, only engine revving will be measured using a decibel meter." },
  { n: 13, category: "measurement", text: "If the engine cuts off during the measurement period, the timer or decibel meter reading will not be reset. The participant may restart the vehicle, and the reading will continue until the original measurement time expires." },
  { n: 14, category: "measurement", text: "The decibel meter will not read pops and bangs." },
  { n: 15, category: "measurement", text: "The flame kit must be turned off during decibel measurement." },
  { n: 16, category: "rounds", text: "After the first round, the top four vehicles will qualify for the final round." },
  { n: 17, category: "rounds", text: "In the final round, if two vehicles record the same decibel reading, the prize will be split equally between them." },
  { n: 18, category: "venue", text: "Vehicles are not allowed to park anywhere on the college premises other than the designated competition venue." },
  { n: 19, category: "venue", text: "Drifting and burnouts are strictly prohibited within the competition venue." },
  { n: 20, category: "measurement", text: "The decibel meter will be placed at a distance of one metre from the exhaust outlet." },
  { n: 21, category: "venue", text: "All vehicles must remain until the end of the competition. They are not allowed to leave during the competition or participate in any other event on the same day." },
  { n: 22, category: "venue", text: "Participants will be fully responsible for their vehicles during the event and transportation." },
  { n: 23, category: "authority", disqualification: true, text: "Any misbehaviour by contestants at any time during the competition will be considered an offence and will result in immediate disqualification." },
  { n: 24, category: "authority", disqualification: true, text: "Violation of any of the above rules and regulations will result in direct disqualification." },
  { n: 25, category: "authority", text: "Any enquiries regarding results or eligibility of other vehicles must be communicated only to the event coordinators." },
  { n: 26, category: "authority", text: "All decisions taken by the event authority will be final." },
];

export const TIMELINE = [
  { n: "01", title: "Arrival", marker: "07:30 AM", text: "Contestants report at 7:30 AM at Thalakkottukara, Thrissur." },
  { n: "02", title: "Vehicle Inspection", marker: "LOT NO.", text: "Vehicles are inspected and assigned a DTD lot number." },
  { n: "03", title: "Lineup", marker: "09:00–09:30 AM", text: "All vehicles must be present from 9:00 AM to 9:30 AM." },
  { n: "04", title: "Entry Rally", marker: "09:30–10:00 AM", text: "The entry rally takes place from 9:30 AM to 10:00 AM." },
  { n: "05", title: "Qualifying Round", marker: "MAX 60 SEC", text: "Each vehicle gets a maximum of one minute. The top four vehicles qualify for the final." },
  { n: "06", title: "Final Round", marker: "TOP 4", text: "The final determines the winner under the competition's measurement rules." },
] as const;

export const FAQS = [
  {
    q: "What is DTD?",
    a: "Destroy The Decibel (DTD) — The Battle of Exhausts — is a car exhaust sound competition organized by the Department of Computer Science & Engineering at Vidya Academy of Science and Technology, Thrissur. Vehicles compete through engine revving, measured with a decibel meter.",
  },
  {
    q: "Which vehicles are eligible?",
    a: "Cars with engine capacities up to 2000 cc are allowed. The exhaust is compulsory and must be present only at the rear side of the vehicle, and an end can is compulsory for all vehicles. Every vehicle is thoroughly checked before the competition, and spot modifications are not allowed.",
  },
  {
    q: "What is the entry fee?",
    a: "The registration fee is ₹1,000 per vehicle.",
  },
  {
    q: "Can I register at the venue?",
    a: "No. Spot registration is not allowed — you must register in advance.",
  },
  {
    q: "How long does each participant get?",
    a: "Participation time for each vehicle is a maximum of one minute. There are no second chances.",
  },
  {
    q: "How many vehicles qualify for the final?",
    a: "After the first round, the top four vehicles qualify for the final round.",
  },
  {
    q: "How is the decibel reading measured?",
    a: "Only engine revving is measured, using a decibel meter placed at a distance of one metre from the exhaust outlet. The meter will not read pops and bangs, and the flame kit must be turned off during measurement.",
  },
  {
    q: "What happens if the engine stops during measurement?",
    a: "The timer and decibel meter reading are not reset. You may restart the vehicle, and the reading continues until the original measurement time expires.",
  },
  {
    q: "Are burnouts and drifting allowed?",
    a: "No. Drifting and burnouts are strictly prohibited within the competition venue.",
  },
  {
    q: "Whom should I contact for eligibility questions?",
    a: "Contact the event coordinators listed in the Contact section. Enquiries regarding results or the eligibility of other vehicles must be communicated only to the event coordinators, and all decisions taken by the event authority are final.",
  },
] as const;

export type Coordinator = {
  name: string;
  /** Exactly as printed on the poster. */
  display: string;
  /** E.164 number for the tel: link. */
  tel: string;
  /** Enable only once the coordinator confirms the number is on WhatsApp. */
  whatsappVerified: boolean;
};

export const COORDINATORS: Coordinator[] = [
  { name: "Aravind Krishna", display: "8590474771", tel: "+918590474771", whatsappVerified: false },
  { name: "Adharv Jayan", display: "+91 77360 46553", tel: "+917736046553", whatsappVerified: false },
  { name: "Adwaith C Shaju", display: "+91 6238 384 063", tel: "+916238384063", whatsappVerified: false },
];

export const formatInr = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
