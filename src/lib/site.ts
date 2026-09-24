export const site = {
  name: "Sydney Occupational Services",
  short: "SOS",
  tagline: "We know work rehab.",
  phone: "+61 2 9615 9791",
  phoneHref: "tel:+61296159791",
  fax: "+61 2 9615 9793",
  email: "referral@sydneyoccupationalservices.com.au",
  emailHref: "mailto:referral@sydneyoccupationalservices.com.au",
  addressLines: ["Level 14, 3 Parramatta Square", "153 Macquarie Street", "Parramatta NSW 2150"],
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
  referral: string;
  process: string[];
  deliverable: string;
  questions: { question: string; answer: string }[];
  nextStep: string;
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
    referral:
      "Refer when an injured worker needs a coordinated return-to-work plan, suitable duties are difficult to identify, or progress has stalled between the workplace, treating team and insurer. Scheme agents, employers and treating doctors can flag the barrier they need resolved.",
    process: [
      "Review the claim context, current medical guidance, pre-injury duties and the worker’s own goals before agreeing on the immediate priorities.",
      "Visit or consult with the workplace to identify duties and modifications that can be implemented, then coordinate a graded plan with the relevant parties.",
      "Monitor the plan as capacity and treatment change, communicate obstacles early and adjust duties or hours rather than leaving a static plan in place.",
    ],
    deliverable:
      "A practical return-to-work plan with agreed duties, hours, responsibilities and review points, supported by progress reporting for the referrer. The scope and review schedule are agreed against the individual claim, not set by a generic program.",
    questions: [
      {
        question: "Does the worker have to be ready for full duties?",
        answer:
          "No. A graded plan can start from medically supported suitable duties and be reviewed as capacity changes. The treating practitioner’s advice and the workplace’s actual options both matter.",
      },
      {
        question: "Where can workplace visits take place?",
        answer:
          "We service Greater Sydney, the Hunter and Wollongong. Tell us the worksite location when referring so the appropriate visit and commencement can be discussed.",
      },
    ],
    nextStep:
      "Send the current certificate of capacity, role description and any existing return-to-work plan with the referral. If the worker needs prompt contact, call to discuss availability.",
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
    referral:
      "A workplace assessment is useful when a claims team or employer needs to know whether particular tasks can be performed safely, which duties can be modified, or why a proposed return-to-work plan is not working in practice.",
    process: [
      "Clarify the worker’s current restrictions and the specific roles or tasks to examine with the referrer and supervisor.",
      "Observe the work as performed, including loads, repetition, postures, pace and any cognitive or scheduling demands. Discuss feasible changes with those who manage the task.",
      "Compare the observed demands with the available capacity information and identify suitable duties, equipment or changes to the task for consideration by the treating team.",
    ],
    deliverable:
      "A task-based account of job demands and actionable recommendations that supervisors, return-to-work coordinators and treating doctors can use. The assessment informs a plan; it does not replace a medical certificate or a treating practitioner’s advice.",
    questions: [
      {
        question: "Is this the same as a functional capacity evaluation?",
        answer:
          "No. A workplace assessment examines the job and its environment. A functional capacity evaluation tests the worker’s abilities; the two may be used together when both sides of the job match are unclear.",
      },
      {
        question: "What should be available for the visit?",
        answer:
          "Provide the proposed duties, roster, relevant restrictions and access to someone who knows how the work is actually performed. Let us know about site induction requirements before booking.",
      },
    ],
    nextStep:
      "Describe the worksite, the tasks in question and the decision the assessment needs to support when you refer.",
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
    referral:
      "Employers and WHS teams can request an ergonomic review for recurring discomfort, a workstation change, a new task design or a pattern of injuries linked to the same job. It can also support a worker returning to an office, industrial or hybrid role.",
    process: [
      "Identify the task, the people doing it and the specific concern rather than starting with a standard desk checklist.",
      "Observe how the workstation or task is used, consider equipment, reach, force, posture and frequency, and discuss workable adjustments with the employee and supervisor.",
      "Prioritise changes and, where relevant, coach the team on how to use the revised setup in day-to-day work.",
    ],
    deliverable:
      "A concise report with photographs, measurements and prioritised recommendations. Training can be directed to the people carrying out or supervising the task so that the changes are understood beyond the initial visit.",
    questions: [
      {
        question: "Do you only assess office desks?",
        answer:
          "No. Reviews can cover office, industrial and hybrid settings. The useful starting point is the specific task and the problem you are trying to prevent or resolve.",
      },
      {
        question: "Will new equipment always be recommended?",
        answer:
          "Not necessarily. Changes to layout, task sequence and existing equipment may be more useful. Recommendations depend on the observed work and its constraints.",
      },
    ],
    nextStep:
      "Tell us the task or workstation, number of people affected and location so we can discuss the right assessment or training scope.",
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
    referral:
      "NSW workers compensation scheme agents can request a work capacity assessment when the available clinical, functional and vocational evidence needs to be brought together for a claim decision. State the decision question and the period the opinion needs to address.",
    process: [
      "Review relevant certificates, clinical reports, claim history, work history and any prior workplace or functional assessments, noting gaps or conflicting evidence.",
      "Consider what work the person may be able to do in light of documented restrictions, transferable skills and realistic employment options, rather than relying only on a job title.",
      "Explain the reasoning, the evidence relied on and any limitations so the referrer can see how the opinion was reached.",
    ],
    deliverable:
      "A reasoned report addressing work capacity and vocational considerations in the NSW scheme context. The assessment provides evidence for the agent’s decision; it is not itself a statutory work capacity decision or a substitute for the agent’s obligations.",
    questions: [
      {
        question: "What records should accompany the referral?",
        answer:
          "Include the question to be answered, recent capacity certificates, relevant medical reports, employment and earnings history, prior assessments and any identified suitable work. We can discuss missing material before assessment.",
      },
      {
        question: "Is a physical test always required?",
        answer:
          "No. A work capacity opinion draws on the relevant evidence and referral scope. Where measured physical abilities are the missing piece, a separate functional capacity evaluation may be appropriate.",
      },
    ],
    nextStep:
      "Send the decision question and available claim evidence; contact us to confirm scope and report timing before relying on a particular deadline.",
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
    referral:
      "An insurer or treating specialist may request a functional capacity evaluation when observed physical ability is needed to plan duties, test a proposed increase in hours or clarify restrictions that remain uncertain after clinical review.",
    process: [
      "Screen the referral and available health information for safe-to-test considerations, then agree which work demands the evaluation should address.",
      "An occupational therapist observes structured tasks such as lifting, carrying, postures and endurance within appropriate safety limits, recording performance and responses rather than assuming a maximum from a diagnosis.",
      "Interpret the findings alongside the supplied job demands and clinical information, including any factors that limit what the testing can establish.",
    ],
    deliverable:
      "A report of the tasks tested, observed tolerances and relevant limitations, with practical implications for a specified job or graded return. Testing captures performance on the assessment day; it is not a guarantee of future ability or a replacement for medical clearance.",
    questions: [
      {
        question: "What if testing is not safe on the day?",
        answer:
          "Safety comes first. Testing may be modified or deferred based on screening and presentation; the report should explain what could and could not be measured.",
      },
      {
        question: "Do you need a job description?",
        answer:
          "A current duties list or workplace demands information makes the findings more useful. Without it, results describe tested abilities but cannot establish a full match to a particular role.",
      },
    ],
    nextStep:
      "Provide the referral question, current restrictions and job demands, then contact us to discuss screening and booking.",
  },
  {
    slug: "vocational-assessment",
    title: "Vocational assessment",
    summary: "Labour-market grounded options when the pre-injury role is no longer realistic.",
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
    referral:
      "Refer when the pre-injury job is no longer a realistic option and a worker, insurer or rehabilitation team needs evidence-based alternatives. A vocational assessment is particularly useful before committing to a training pathway or job search direction.",
    process: [
      "Review the person’s work history, qualifications, interests and current medical restrictions, and clarify transport and other practical constraints relevant to employment.",
      "Identify transferable skills and compare potential occupations against actual role requirements and local labour-market information.",
      "Consider whether targeted retraining or work trials would materially improve access to suitable roles, and explain any barriers still to be resolved.",
    ],
    deliverable:
      "A vocational report setting out supported job options, their fit with restrictions and skills, and the evidence or assumptions behind each option. It can inform return-to-work planning; it does not promise a vacancy or placement.",
    questions: [
      {
        question: "Will the report just list possible jobs?",
        answer:
          "No. Options should be connected to the worker’s background, capacity and the labour market in Greater Sydney, the Hunter or Wollongong, with limitations made clear.",
      },
      {
        question: "Does the worker need a final medical prognosis?",
        answer:
          "Not always, but the current restrictions and expected changes need to be clear enough to assess options. Share the latest clinical information and any uncertainty with the referral.",
      },
    ],
    nextStep:
      "Send the worker’s work history, current capacity information and the vocational question to be answered.",
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
    referral:
      "Employers and recruiters can request pre-employment screening when a position has defined physical or functional demands that should be assessed consistently against its inherent requirements. Provide the actual role, not just a position title.",
    process: [
      "Agree on the essential tasks and demands of the role so the screening protocol is relevant to the work rather than a broad, unrelated medical questionnaire.",
      "Assess the candidate against those requirements using appropriate physical and functional measures, with attention to safety and any information needed to interpret the result.",
      "Report the findings against the role and explain where a condition, further information or adjustment needs consideration.",
    ],
    deliverable:
      "A role-matched fit, conditional or unfit finding with a rationale tied to the assessed requirements. The report addresses the defined role at the time of assessment, not a candidate’s general health or ability to do every job.",
    questions: [
      {
        question: "Can a generic job title be used to book?",
        answer:
          "A position description and details of actual lifting, postures, repetition and work environment are more useful. We can clarify the required information before setting the protocol.",
      },
      {
        question: "How quickly can an assessment be arranged?",
        answer:
          "Same-week booking is available in Sydney, subject to capacity and the role information being ready. Confirm the location and desired date when you contact us.",
      },
    ],
    nextStep:
      "Share the role description, inherent requirements, location and hiring timeframe to discuss an appropriate screening scope.",
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
    referral:
      "WHS and operations leads can request manual handling training for teams regularly lifting, carrying, pushing or moving loads, especially where incidents recur or a new task has changed the risks. The session is designed around the work people actually do.",
    process: [
      "Identify the loads, equipment, workspace and tasks to be covered with a supervisor before training, including any known injury patterns or difficult movements.",
      "Deliver practical coaching at the worksite using the team’s everyday setup, with opportunities to discuss safer task methods and when equipment or task changes are needed.",
      "Leave supervisors with a short refresh they can use in toolbox talks to reinforce the agreed practices.",
    ],
    deliverable:
      "Task-specific on-site instruction and a supervisor refresh pack. Training helps staff understand safer ways of working, but it does not remove the need to assess hazards and improve unsafe task design or equipment.",
    questions: [
      {
        question: "Can the session use our own equipment and loads?",
        answer:
          "Yes. Using the actual worksite layout and routine tasks is the point of the session. Explain the tasks and access requirements when arranging the visit.",
      },
      {
        question: "Is training enough if a task is inherently unsafe?",
        answer:
          "No. Coaching should sit alongside practical controls such as task redesign or handling aids. We can discuss whether a task or ergonomic assessment is needed first.",
      },
    ],
    nextStep:
      "Tell us the worksite, team size and tasks to cover so the training can be scoped for your operation.",
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
    image: "/images/greg-weir.jpg",
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
    image: "/images/matt-holdt.jpg",
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
