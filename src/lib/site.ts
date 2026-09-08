export const site = {
  name: "Sydney Occupational Services",
  short: "SOS",
  tagline: "We know work rehab.",
  phone: "+61 2 9615 9791",
  phoneHref: "tel:+61296159791",
  fax: "+61 2 9615 9793",
  email: "referral@sydneyoccupationalservices.com.au",
  emailHref: "mailto:referral@sydneyoccupationalservices.com.au",
  addressLines: [
    "Level 14, 3 Parramatta Square",
    "153 Macquarie Street",
    "Parramatta NSW 2150",
  ],
  regions: "Greater Sydney, Hunter and Wollongong",
};

export type Service = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  audience: string;
  body: string[];
  outcomes: string[];
};

export const services: Service[] = [
  {
    slug: "workplace-rehabilitation",
    title: "Workplace rehabilitation",
    summary:
      "Durable return-to-work programs that keep the worker, employer and insurer aligned from first referral to discharge.",
    image: "/images/hero.jpg",
    audience: "Insurers, employers, treating doctors",
    body: [
      "Sydney Occupational Services is a SIRA-accredited workplace rehabilitation provider focused on the NSW workers compensation scheme. We design and manage return-to-work plans that are clinically sound and commercially realistic.",
      "Consultants stay close to the workplace. Suitable duties, graded hours, treatment coordination and stakeholder meetings are handled by the same senior clinician — not a rotating case list.",
      "We work with every NSW scheme agent, national employers and specialist treatment providers so the plan does not stall between parties.",
    ],
    outcomes: [
      "Same-week commencement on most referrals",
      "Senior consultant ownership, not junior overflow",
      "Clear reporting to agents and employers",
    ],
  },
  {
    slug: "workplace-assessment",
    title: "Workplace assessment",
    summary:
      "On-site review of duties, physical demand and available modifications so a safe return can actually happen.",
    image: "/images/files.jpg",
    audience: "Employers and claims teams",
    body: [
      "A workplace assessment maps the real job — postures, lifts, cognitive load, rostering and the culture of the floor — against the worker’s current capacity.",
      "Recommendations are written for the people who have to implement them: supervisors, RTW coordinators and treating doctors.",
    ],
    outcomes: [
      "Documented physical and cognitive demands",
      "Suitable duties identified on the day",
      "Practical modifications, not generic checklists",
    ],
  },
  {
    slug: "ergonomic-assessment",
    title: "Ergonomic assessment & training",
    summary:
      "Workstation and task design that prevents injury from becoming a claim — and keeps recovered workers at work.",
    image: "/images/ergonomic.jpg",
    audience: "Employers and WHS teams",
    body: [
      "Matt Holdt holds a Graduate Diploma in Ergonomics from UNSW. Assessments cover office, industrial and hybrid settings, with training delivered to the people who sit or stand at the task every day.",
      "Reports stay short and usable: photographs, measurements, and a ranked list of changes.",
    ],
    outcomes: [
      "Office and industrial task reviews",
      "Team training that supervisors can repeat",
      "Evidence-based recommendations",
    ],
  },
  {
    slug: "work-capacity",
    title: "Work capacity assessment",
    summary:
      "Independent capacity opinions that help scheme agents make defensible decisions under the NSW legislation.",
    image: "/images/files.jpg",
    audience: "Scheme agents",
    body: [
      "Work capacity assessments bring medical evidence, observed function and vocational reality into one document. They are written for decision-makers who need to stand behind the finding.",
    ],
    outcomes: [
      "Legislative framing for NSW claims",
      "Clear residual work capacity",
      "Vocational options that exist in the labour market",
    ],
  },
  {
    slug: "functional-capacity",
    title: "Functional capacity evaluation",
    summary:
      "Structured testing of lift, carry, posture and endurance so restrictions are measured, not guessed.",
    image: "/images/fce.jpg",
    audience: "Insurers and treating specialists",
    body: [
      "Functional capacity evaluations are conducted by occupational therapists using standardised protocols. Results are mapped to job demands so the next step — stay at work, grade up, or redirect — is obvious.",
    ],
    outcomes: [
      "Standardised physical testing",
      "Job-matched interpretation",
      "Safe-to-test screening before the day",
    ],
  },
  {
    slug: "vocational-assessment",
    title: "Vocational assessment",
    summary:
      "Labour-market grounded options when the pre-injury role is no longer realistic.",
    image: "/images/files.jpg",
    audience: "Insurers and injured workers",
    body: [
      "Vocational assessments look at transferable skills, medical restrictions and actual vacancies in Greater Sydney, the Hunter and Wollongong — not a national template list.",
    ],
    outcomes: [
      "Transferable skills analysis",
      "Local labour market evidence",
      "Retraining only where it changes the outcome",
    ],
  },
  {
    slug: "pre-employment",
    title: "Pre-employment assessment",
    summary:
      "Fit-for-role screening before a hire, so inherent requirements are tested rather than assumed.",
    image: "/images/fce.jpg",
    audience: "Employers and recruiters",
    body: [
      "Pre-employment assessments are built from the actual job, not a generic medical form. Physical and functional screening is matched to inherent requirements so the offer is fair and defensible.",
    ],
    outcomes: [
      "Role-specific protocols",
      "Same-week booking in Sydney",
      "Clear fit / conditional / unfit findings",
    ],
  },
  {
    slug: "manual-handling",
    title: "Manual handling training",
    summary:
      "Practical coaching on the floor — not a slide deck — for teams who lift, carry and push every shift.",
    image: "/images/manual.jpg",
    audience: "WHS and operations leads",
    body: [
      "Training is delivered at the worksite using the loads and layouts the team already has. Supervisors leave with a short refresh they can run at toolbox talks.",
    ],
    outcomes: [
      "On-site delivery across Greater Sydney",
      "Task-specific techniques",
      "Supervisor refresh pack included",
    ],
  },
];

export type Person = {
  slug: string;
  name: string;
  role: string;
  image: string;
  mobile: string;
  mobileHref: string;
  email: string;
  languages?: string;
  bio: string[];
};

export const team: Person[] = [
  {
    slug: "greg-weir",
    name: "Greg Weir",
    role: "Director & Senior Consultant",
    image: "/images/greg.jpg",
    mobile: "0400 089 606",
    mobileHref: "tel:+61400089606",
    email: "greg@sydneyoccupationalservices.com.au",
    bio: [
      "After completing a B.App.Sc. (Occupational Therapy) at The University of Sydney, Greg began in workplace rehabilitation with IRS Total Injury Management in 1995, working with Australia Post, BHP and Westfield Construction.",
      "In 1997 he was appointed Principal Consultant to Ansett Australia, providing on-site safety and rehabilitation to cabin crew, ramp, engineering, catering, cargo and courier operations. He later joined HIH as Medical Case Coordinator, then led injury management at NRMA Workers Compensation (now CGU) — coaching claims staff, designing RTW training and establishing an in-house occupational physician service.",
      "In 2004 Greg founded Sydney Occupational Services with Matt Holdt. He still takes a caseload and spends his energy on the specialist treatment relationships that make a recovery durable.",
    ],
  },
  {
    slug: "matt-holdt",
    name: "Matthew Holdt",
    role: "Director & Senior Consultant, Occupational Therapist",
    image: "/images/matt.jpg",
    mobile: "0410 695 464",
    mobileHref: "tel:+61410695464",
    email: "matt@sydneyoccupationalservices.com.au",
    languages: "English and Portuguese",
    bio: [
      "Matt graduated from The University of Sydney in 1996 with a B.App.Sc. in Occupational Therapy. He worked across acute care and clinical rehabilitation before moving into workplace rehab, then into provider management while still carrying a caseload.",
      "He co-founded Sydney Occupational Services in 2004 and remains in both leadership and service delivery. A Graduate Diploma in Ergonomics from UNSW underpins the firm’s preventative work as well as its claims work.",
      "Matt’s practice is driven by clinical research and evidence-based medicine — the same standard he expects of the treatment providers SOS refers to.",
    ],
  },
];

export const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/team", label: "Team" },
  { to: "/locations", label: "Locations" },
  { to: "/downloads", label: "Referrals" },
  { to: "/contact", label: "Contact" },
] as const;
