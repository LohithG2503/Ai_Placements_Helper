import mongoose from 'mongoose';
import Company from '../models/Company.js';
import dotenv from 'dotenv';

dotenv.config();

const companies = [
  {
    name: "Tata Consultancy Services",
    description: "TCS is India's largest IT services company and one of the largest multinational companies globally.",
    headquarters: "Mumbai, India",
    industry: "Information Technology",
    founded: "1968",
    employeeCount: "600000+",
    revenue: "$25.7 billion (2023)",
    website: "https://www.tcs.com",
    source: "database",
    culture: {
      workLifeBalance: "Good work-life balance with flexible hours",
      learningOpportunities: "Extensive training programs and certifications",
      teamEnvironment: "Collaborative and professional",
      values: ["Integrity", "Leading Change", "Excellence", "Respect for the Individual", "Learning and Sharing"]
    },
    benefits: {
      healthcare: "Comprehensive medical coverage",
      insurance: "Life and accident insurance",
      leaves: "Paid time off, sick leave, and parental leave",
      additionalPerks: ["Transportation facilities", "Gym membership", "Food subsidies"]
    },
    careerGrowth: {
      promotionOpportunities: "Regular performance reviews and promotions",
      trainingPrograms: "TCS Learning Platform, Digital Learning",
      mentorship: "Formal mentorship programs available"
    },
    interviewProcess: {
      rounds: ["Online test", "Technical interview", "HR interview", "Managerial round"],
      typicalDuration: "2-4 weeks",
      tips: ["Focus on core concepts", "Practice coding problems", "Research company values"]
    }
  },
  {
    name: "Infosys",
    description: "Infosys is a global leader in next-generation digital services and consulting, enabling clients in more than 56 countries to navigate their digital transformation. With over four decades of experience in managing the systems and workings of global enterprises, Infosys expertly steers clients through their digital journey by enabling them with an AI-powered core, delivering digital-first strategies, and implementing agile digital at scale. The company is known for having one of the strongest training programs for fresh graduates in the industry, with its Global Education Center in Mysore being one of the world's largest corporate training centers.",
    headquarters: "Bangalore, India",
    industry: "Information Technology",
    founded: "1981",
    employeeCount: "300,000+",
    revenue: "$18.2 billion (2023)",
    website: "https://www.infosys.com",
    source: "database",
    ceo: "Salil Parekh",
    socialMedia: {
      linkedin: "https://www.linkedin.com/company/infosys/",
      twitter: "https://twitter.com/Infosys",
      facebook: "https://www.facebook.com/Infosys/",
      instagram: "https://www.instagram.com/infosys/",
      youtube: "https://www.youtube.com/user/Infosys"
    },
    stockInfo: {
      symbol: "INFY",
      exchange: "NYSE, BSE, NSE",
      marketCap: "$72.3 billion (2023)",
      stockPrice: "Variable, check current market",
      lastUpdated: new Date()
    },
    achievements: [
      "Ranked among the top 3 IT services brands globally by Brand Finance",
      "First Indian IT company to be listed on NASDAQ",
      "Recognized as one of the World's Most Ethical Companies by Ethisphere Institute for multiple years",
      "Carbon neutral operations across all global offices since 2020",
      "Winner of multiple awards for diversity and inclusion initiatives"
    ],
    awards: [
      "Recognized as a Leader in Gartner Magic Quadrant for IT Services",
      "Forbes World's Best Regarded Companies",
      "Great Place to Work Certified",
      "Bloomberg Gender-Equality Index Member",
      "Top Employer certification in multiple regions"
    ],
    competitors: [
      "Tata Consultancy Services",
      "Accenture",
      "Cognizant",
      "Wipro",
      "HCL Technologies",
      "IBM Global Services",
      "Capgemini"
    ],
    technologies: [
      "Cloud Computing",
      "Artificial Intelligence",
      "Machine Learning",
      "Blockchain",
      "Internet of Things (IoT)",
      "Robotic Process Automation",
      "Data Analytics",
      "Cybersecurity",
      "Digital Experience Platforms",
      "Industry 4.0 Solutions"
    ],
    productsAndServices: [
      "Digital Transformation Services",
      "Cloud Services",
      "AI & Automation",
      "Data Analytics",
      "Engineering Services",
      "IoT Solutions",
      "Infosys Finacle (Banking Platform)",
      "Infosys Wingspan (Learning Platform)",
      "Infosys Cobalt (Cloud Solutions)",
      "EdgeVerve Systems (Product Subsidiary)",
      "Business Process Management",
      "Experience Design Services"
    ],
    officeLocations: [
      "Bangalore, India (Headquarters)",
      "Pune, India",
      "Chennai, India",
      "Hyderabad, India",
      "New York, USA",
      "London, UK",
      "Frankfurt, Germany",
      "Shanghai, China",
      "Tokyo, Japan",
      "Singapore",
      "Sydney, Australia",
      "Toronto, Canada"
    ],
    workEnvironment: {
      officeType: "Hybrid",
      dressCode: "Business casual; Formal on client meetings",
      workHours: "40 hours per week, typically 9am-6pm",
      wfhPolicy: "Hybrid model with 2-3 days in office depending on role and project requirements"
    },
    hiringProcess: {
      avgTimeToHire: "3-4 weeks for experienced candidates, 2-3 months for campus recruitment",
      applicationPortal: "https://careers.infosys.com",
      referralBonus: "Available for employees, varies by role and location",
      requiredDocuments: ["Resume/CV", "Educational certificates", "ID proof", "Address proof", "Previous employment proof", "Background verification consent"],
      backgroundCheckInfo: "Comprehensive background verification including education, employment, and criminal records check"
    },
    salaryInfo: {
      averageSalary: {
        entrylevel: "₹3.6 - ₹4.5 lakhs ($4,500 - $5,500) for fresh graduates in India",
        midlevel: "₹8 - ₹16 lakhs ($10,000 - $20,000) in India",
        seniorlevel: "₹20 - ₹40 lakhs ($25,000 - $50,000) in India",
        executive: "₹80 lakhs+ ($100,000+) varies significantly by location"
      },
      bonusStructure: "Performance-linked variable pay, typically 10-20% of fixed salary",
      salaryReviewCycle: "Annual with mid-year reviews",
      equityOptions: "RSUs (Restricted Stock Units) for mid to senior level employees"
    },
    pros: [
      "Excellent training and learning opportunities for freshers",
      "Global exposure and chance to work with Fortune 500 clients",
      "Structured career progression path",
      "Strong brand name that adds value to resume",
      "Good work-life balance compared to many IT companies",
      "Comprehensive benefits package",
      "Opportunities to work across various domains and technologies"
    ],
    cons: [
      "Salary can be lower than industry average, especially for experienced professionals",
      "Hierarchical structure can slow down decision making",
      "Project allocation may not always align with employee's preference",
      "Variable work pressure depending on client and project",
      "Some roles may involve monotonous work",
      "Promotions can be slow for average performers"
    ],
    culture: {
      workLifeBalance: "Structured work hours with good balance; varies by project and client",
      learningOpportunities: "Extensive through Infosys Learning Platform, certifications, and training programs",
      teamEnvironment: "Global teams with diverse culture; collaborative work environment",
      values: ["Client Value", "Leadership by Example", "Integrity and Transparency", "Fairness", "Excellence", "Respect for Individual"],
      diversityInitiatives: "Strong focus on gender diversity, disability inclusion, and cultural diversity with specific programs and targets",
      communicationStyle: "Formal and hierarchical with regular team meetings and town halls",
      managementStyle: "Process-oriented with clear reporting structures and defined roles"
    },
    benefits: {
      healthcare: "Comprehensive health insurance for employee and family including parents",
      insurance: "Term life insurance, accident insurance, and disability coverage",
      leaves: "Annual leave (20-25 days), sick leave, casual leave, and sabbatical options after certain tenure",
      additionalPerks: ["Campus facilities including gyms and recreation areas", "Sports complex with multiple sports facilities", "Food courts and subsidized meals", "Transport facilities in major locations", "Employee discount programs", "Wellness programs"],
      retirement: "Provident Fund (PF) in India, 401(k) in US locations",
      educationAssistance: "Education assistance programs for higher studies and certifications",
      wellnessPrograms: "Physical and mental wellness initiatives, stress management programs",
      mealBenefits: "Subsidized meals at campus locations, food courts with multiple options"
    },
    careerGrowth: {
      promotionOpportunities: "Merit-based growth with clear career paths; typical promotion cycle of 2-3 years",
      trainingPrograms: "Infosys Leadership Institute, technical certification programs, soft skills training",
      mentorship: "Structured mentorship programs available for high-potential employees",
      careerPaths: ["Technical", "Management", "Consulting", "Product Development", "Domain Specialization"],
      performanceReviewProcess: "Bi-annual performance reviews with goal setting and feedback sessions",
      internalMobilityOptions: "Internal job posting system for cross-functional and geographic mobility after 1-2 years in current role"
    },
    interviewProcess: {
      rounds: ["Online assessment (InfyTQ for freshers)", "Technical/domain interview", "HR discussion", "Manager/client interview for experienced candidates"],
      typicalDuration: "2-3 weeks for experienced professionals; longer for campus recruitment",
      tips: ["Strong understanding of programming fundamentals for technical roles", "Excellent communication skills", "Analytical thinking ability", "Project experience relevant to applied position", "Knowledge of company values and business model"],
      commonQuestions: [
        "Coding problems on data structures and algorithms for technical roles",
        "Questions on projects mentioned in resume",
        "Scenario-based problem-solving questions",
        "Questions on teamwork and conflict resolution",
        "Why do you want to join Infosys?",
        "Where do you see yourself in 5 years?",
        "How do you handle work pressure and deadlines?"
      ],
      dresscode: "Formal attire recommended for all interviews",
      onlineAssessments: "InfyTQ platform for freshers, HackerRank or similar for lateral hiring"
    },
    reviews: [
      {
        position: "Senior Software Engineer",
        rating: 4.0,
        pros: "Good work-life balance, excellent training programs, global exposure",
        cons: "Salary below market average, slow promotions, project allocation not always aligned with interests",
        advice: "Take advantage of the learning platforms and certification opportunities",
        date: new Date("2023-08-10")
      },
      {
        position: "Project Manager",
        rating: 3.8,
        pros: "Stable work environment, structured processes, good benefits",
        cons: "Bureaucratic decision making, resistance to change in some departments",
        advice: "Network across departments and build relationships with senior leaders",
        date: new Date("2023-06-22")
      }
    ],
    recentNews: [
      {
        title: "Infosys Collaborates with Microsoft on AI Solutions",
        summary: "Infosys announced strategic collaboration with Microsoft to develop industry-specific AI solutions",
        date: new Date("2023-11-18"),
        url: "https://www.infosys.com/newsroom/"
      },
      {
        title: "Infosys Expands European Presence with New Digital Hub",
        summary: "New digital innovation center opened in Europe to serve clients with digital transformation needs",
        date: new Date("2023-10-05"),
        url: "https://www.infosys.com/newsroom/"
      }
    ]
  },
  {
    name: "Accenture",
    description: "Accenture is a global professional services company with leading capabilities in digital, cloud and security. Combining unmatched experience and specialized skills across more than 40 industries, Accenture offers strategy and consulting, technology and operations services, and a global center of innovation powered by advanced technology and intelligent operations. Accenture has over 300,000 employees in India, representing a significant portion of its global workforce of 774,000.",
    headquarters: "Dublin, Ireland",
    industry: "Professional Services",
    founded: "1989",
    employeeCount: "774,000",
    revenue: "$64.1 billion (2023)",
    website: "https://www.accenture.com",
    source: "database",
    ceo: "Julie Sweet",
    socialMedia: {
      linkedin: "https://www.linkedin.com/company/accenture/",
      twitter: "https://twitter.com/Accenture",
      facebook: "https://www.facebook.com/accenture",
      instagram: "https://www.instagram.com/accenture/",
      youtube: "https://www.youtube.com/accenture"
    },
    stockInfo: {
      symbol: "ACN",
      exchange: "NYSE",
      marketCap: "$226 billion (2023)",
      stockPrice: "Variable, check current market",
      lastUpdated: new Date()
    },
    achievements: [
      "Ranked among Fortune's World's Most Admired Companies for 21 consecutive years",
      "Recognized as one of the top 50 companies for diversity by DiversityInc",
      "Leader in Gartner Magic Quadrant for multiple technology and consulting categories",
      "One of the world's largest employers with 774,000 people serving clients in more than 120 countries",
      "Has over 300,000 employees in India, making it one of the largest multinational employers in the country"
    ],
    awards: [
      "Fortune's World's Most Admired Companies",
      "Ethisphere's World's Most Ethical Companies",
      "Forbes' Best Employers for Diversity",
      "Great Place to Work Certified"
    ],
    competitors: [
      "Deloitte",
      "IBM",
      "Cognizant",
      "Tata Consultancy Services",
      "Infosys",
      "Wipro",
      "Capgemini"
    ],
    technologies: [
      "Cloud Computing",
      "Artificial Intelligence",
      "Blockchain",
      "Extended Reality",
      "Quantum Computing",
      "Robotics",
      "Industry-specific platforms"
    ],
    productsAndServices: [
      "Strategy & Consulting",
      "Technology Services",
      "Operations",
      "Accenture Song (formerly Interactive)",
      "Industry X (Digital Manufacturing)",
      "Applied Intelligence",
      "Cloud First Services",
      "Security Services"
    ],
    officeLocations: [
      "Dublin, Ireland (Headquarters)",
      "Bangalore, India",
      "Mumbai, India",
      "Hyderabad, India",
      "Chennai, India",
      "New York, USA",
      "London, UK",
      "Paris, France",
      "Singapore",
      "Tokyo, Japan"
    ],
    workEnvironment: {
      officeType: "Hybrid",
      dressCode: "Business casual; client-dependent",
      workHours: "Flexible with core hours; project-dependent",
      wfhPolicy: "Hybrid model based on client and project requirements"
    },
    hiringProcess: {
      avgTimeToHire: "3-6 weeks",
      applicationPortal: "https://www.accenture.com/careers",
      referralBonus: "Available for employees",
      requiredDocuments: ["Resume", "Cover Letter", "Educational certificates", "ID proofs"],
      backgroundCheckInfo: "Comprehensive background verification is required"
    },
    salaryInfo: {
      averageSalary: {
        entrylevel: "$60,000 - $85,000",
        midlevel: "$85,000 - $130,000",
        seniorlevel: "$130,000 - $180,000",
        executive: "$180,000+"
      },
      bonusStructure: "Annual performance bonus, variable pay",
      salaryReviewCycle: "Annual",
      equityOptions: "Available for senior roles"
    },
    pros: [
      "Global exposure and diverse project experience",
      "Excellent learning and development opportunities",
      "Strong brand reputation and client portfolio",
      "Career mobility across industries and geographies",
      "Comprehensive benefits package"
    ],
    cons: [
      "Work-life balance can be challenging on some projects",
      "High performance expectations",
      "Large organization can feel bureaucratic",
      "Client-dependent work environments",
      "Frequent travel may be required for some roles"
    ],
    culture: {
      workLifeBalance: "Flexible working hours and remote work options, though varies by project",
      learningOpportunities: "Continuous learning through Accenture Connected Learning and specialized academies",
      teamEnvironment: "Diverse and inclusive workplace with global teaming opportunities",
      values: ["Stewardship", "Best People", "Client Value Creation", "One Global Network", "Respect for the Individual", "Integrity"],
      diversityInitiatives: "Robust inclusion and diversity programs with employee resource groups",
      communicationStyle: "Collaborative with regular touchpoints and formal reporting structures",
      managementStyle: "Matrix organization with multiple reporting lines"
    },
    benefits: {
      healthcare: "Comprehensive medical benefits with global coverage options",
      insurance: "Life and disability insurance",
      leaves: "Vacation, holidays, and generous parental leave policies",
      additionalPerks: ["Employee discount program", "Wellness programs", "Professional development", "Mental health support"],
      retirement: "Retirement savings plans with company matching",
      educationAssistance: "Tuition reimbursement and continuous learning programs",
      wellnessPrograms: "Holistic wellness initiatives including physical and mental wellbeing"
    },
    careerGrowth: {
      promotionOpportunities: "Clear career paths and growth opportunities with well-defined levels",
      trainingPrograms: "Technology and leadership training through specialized academies",
      mentorship: "Global mentorship programs and networking opportunities",
      careerPaths: ["Consulting", "Technology", "Operations", "Industry Specialization", "Management"],
      performanceReviewProcess: "Regular performance discussions with annual formal reviews",
      internalMobilityOptions: "Global rotation opportunities and internal job market"
    },
    interviewProcess: {
      rounds: ["Online assessment", "Technical interview", "HR interview", "Case study presentation", "Final partner/managing director discussion"],
      typicalDuration: "3-4 weeks",
      tips: ["Research latest technology trends", "Prepare case studies", "Show adaptability", "Demonstrate client-focused mindset", "Practice STAR format responses"],
      commonQuestions: [
        "Tell me about a challenging client situation and how you handled it",
        "How do you stay current with industry and technology trends?",
        "Describe a time when you had to influence stakeholders",
        "How would you approach a project with ambiguous requirements?",
        "What do you know about Accenture's business and values?"
      ]
    },
    recentNews: [
      {
        title: "Accenture to Acquire Kyndryl's India Business",
        summary: "Strategic acquisition to strengthen Accenture's technology services capabilities in India",
        date: new Date("2023-11-10"),
        url: "https://newsroom.accenture.com/"
      },
      {
        title: "Accenture Invests in AI Innovation Centers in India",
        summary: "New advanced AI centers in Bangalore and Hyderabad to drive next-generation solutions",
        date: new Date("2023-09-15"),
        url: "https://newsroom.accenture.com/"
      }
    ]
  },
  {
    name: "Google",
    description: "Google is a multinational technology company specializing in internet-related services and products, including online advertising technologies, search engine, cloud computing, software, and hardware.",
    headquarters: "Mountain View, California, USA",
    industry: "Technology",
    founded: "1998",
    employeeCount: "156,000+",
    revenue: "$282.8 billion (2023)",
    website: "https://www.google.com",
    source: "database",
    ceo: "Sundar Pichai",
    socialMedia: {
      linkedin: "https://www.linkedin.com/company/google/",
      twitter: "https://twitter.com/Google",
      facebook: "https://www.facebook.com/Google/",
      instagram: "https://www.instagram.com/google/",
      youtube: "https://www.youtube.com/google",
      github: "https://github.com/google"
    },
    stockInfo: {
      symbol: "GOOGL",
      exchange: "NASDAQ",
      marketCap: "$1.7 trillion (2023)",
      stockPrice: "Variable, check current market",
      lastUpdated: new Date()
    },
    achievements: [
      "Developed the world's most popular search engine",
      "Created Android, the world's most widely used mobile operating system",
      "Pioneered numerous AI and machine learning technologies",
      "Built Chrome, one of the world's most popular web browsers",
      "Developed Gmail, one of the most widely used email services"
    ],
    awards: [
      "Fortune's 100 Best Companies to Work For (multiple years)",
      "World's Most Valuable Brand (multiple years)",
      "Fast Company's Most Innovative Companies",
      "Glassdoor's Best Places to Work"
    ],
    competitors: [
      "Microsoft",
      "Apple",
      "Amazon",
      "Facebook (Meta)",
      "Baidu",
      "Alibaba"
    ],
    technologies: [
      "Artificial Intelligence",
      "Machine Learning",
      "Cloud Computing",
      "Big Data",
      "Android",
      "Chrome",
      "TensorFlow",
      "Kubernetes"
    ],
    productsAndServices: [
      "Google Search",
      "Gmail",
      "Google Maps",
      "Google Cloud Platform",
      "YouTube",
      "Android",
      "Google Workspace",
      "Google Ads",
      "Pixel smartphones",
      "Chrome browser"
    ],
    officeLocations: [
      "Mountain View, CA (Headquarters)",
      "New York, NY",
      "Seattle, WA",
      "London, UK",
      "Zurich, Switzerland",
      "Singapore",
      "Tokyo, Japan",
      "Sydney, Australia",
      "Bangalore, India",
      "Dublin, Ireland"
    ],
    workEnvironment: {
      officeType: "Hybrid",
      dressCode: "Casual",
      workHours: "Flexible, with core hours",
      wfhPolicy: "Hybrid work model with several days per week in office, varying by team"
    },
    hiringProcess: {
      avgTimeToHire: "4-8 weeks",
      applicationPortal: "https://careers.google.com/",
      referralBonus: "Available for employees",
      requiredDocuments: ["Resume", "Cover Letter (optional)", "Portfolio (for design roles)"],
      backgroundCheckInfo: "Standard background checks required for all hires"
    },
    salaryInfo: {
      averageSalary: {
        entrylevel: "$120,000 - $150,000",
        midlevel: "$150,000 - $220,000",
        seniorlevel: "$220,000 - $350,000",
        executive: "$350,000+"
      },
      bonusStructure: "Annual performance bonus, equity grants",
      salaryReviewCycle: "Annual",
      equityOptions: "RSUs (Restricted Stock Units) for most full-time employees"
    },
    pros: [
      "Excellent compensation and benefits package",
      "Challenging technical problems to solve",
      "Opportunities to work on influential products",
      "Strong emphasis on work-life balance",
      "Access to cutting-edge technology and research"
    ],
    cons: [
      "Large organization can be bureaucratic",
      "Promotion process can be challenging",
      "Some projects may be canceled unexpectedly",
      "Work can vary greatly between teams",
      "High expectations and performance standards"
    ],
    culture: {
      workLifeBalance: "Good work-life balance with flexibility",
      learningOpportunities: "Abundant learning resources, courses, and conferences",
      teamEnvironment: "Collaborative with focus on innovation",
      values: ["Innovation", "User-Focus", "Data-Driven Decision Making", "Think Big", "Diversity and Inclusion"],
      diversityInitiatives: "Multiple employee resource groups, diversity hiring initiatives, and inclusive workplace policies",
      communicationStyle: "Open and transparent with regular all-hands and team meetings",
      managementStyle: "Bottom-up innovation with flat hierarchy in many teams"
    },
    benefits: {
      healthcare: "Comprehensive health, dental, and vision insurance",
      insurance: "Life and disability insurance",
      leaves: "Generous paid time off, parental leave (up to 24 weeks)",
      additionalPerks: ["Free meals", "Transportation", "Wellness programs", "Education reimbursement"],
      retirement: "401(k) with company match",
      educationAssistance: "Tuition reimbursement and learning stipends",
      wellnessPrograms: "On-site fitness centers, wellness workshops, mental health resources",
      mealBenefits: "Free breakfast, lunch, and dinner at many locations"
    },
    careerGrowth: {
      promotionOpportunities: "Well-defined career ladders with regular promotion cycles",
      trainingPrograms: "Internal training courses, rotation programs, and mentorship",
      mentorship: "Formal and informal mentoring available",
      careerPaths: ["Technical", "Management", "Product", "Research"],
      performanceReviewProcess: "Biannual performance reviews with peer feedback",
      internalMobilityOptions: "Internal job postings and transfer options after 1 year in role"
    },
    interviewProcess: {
      rounds: ["Initial recruiter screen", "Technical phone interview", "Online assessment", "Onsite interviews (4-6 rounds)", "Hiring committee review"],
      typicalDuration: "4-8 weeks end-to-end",
      tips: ["Focus on data structures and algorithms", "Practice system design", "Show problem-solving approach", "Prepare STAR method responses for behavioral questions"],
      commonQuestions: [
        "Coding challenges involving arrays, strings, trees, and graphs",
        "System design questions for senior roles",
        "Behavioral questions about teamwork and challenges",
        "Questions about Google products and improvements"
      ],
      dresscode: "Casual/business casual",
      onlineAssessments: "HackerRank or similar platform for initial coding evaluation"
    },
    reviews: [
      {
        position: "Software Engineer",
        rating: 4.5,
        pros: "Great compensation, interesting work, smart colleagues",
        cons: "Large company bureaucracy, competitive environment",
        advice: "Take advantage of the 20% time to explore your interests",
        date: new Date("2023-10-15")
      },
      {
        position: "Product Manager",
        rating: 4.2,
        pros: "Impactful work, great resources, amazing colleagues",
        cons: "Highly political at times, hard to stand out",
        advice: "Build strong relationships across teams",
        date: new Date("2023-09-05")
      }
    ],
    recentNews: [
      {
        title: "Google Announces New AI Models",
        summary: "Google unveiled its latest AI language models with improved capabilities",
        date: new Date("2023-12-07"),
        url: "https://blog.google/technology/"
      },
      {
        title: "Google Cloud Expands Global Infrastructure",
        summary: "New data centers announced in Asia and Europe",
        date: new Date("2023-11-15"),
        url: "https://cloud.google.com/blog/"
      }
    ]
  },
  {
    name: "Microsoft",
    description: "Microsoft Corporation is a multinational technology company that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, personal computers, and related services. Founded by Bill Gates and Paul Allen, Microsoft has become one of the world's most valuable companies, known for products like Windows, Office, Azure, and Xbox.",
    headquarters: "Redmond, Washington, United States",
    industry: "Technology",
    founded: "1975",
    employeeCount: "221,000+",
    revenue: "$198.3 billion (2022)",
    website: "https://www.microsoft.com",
    source: "database",
    ceo: "Satya Nadella",
    culture: {
      workLifeBalance: "Strong emphasis on work-life balance",
      learningOpportunities: "Extensive learning resources and certification programs",
      teamEnvironment: "Collaborative and innovative",
      values: ["Innovation", "Diversity & Inclusion", "Corporate Social Responsibility", "Growth Mindset"]
    },
    benefits: {
      healthcare: "Comprehensive medical coverage",
      insurance: "Life and disability insurance",
      leaves: "Generous paid time off and parental leave",
      additionalPerks: ["Stock options", "401(k) matching", "Employee discounts", "Wellness programs"]
    },
    careerGrowth: {
      promotionOpportunities: "Merit-based growth with clear career paths",
      trainingPrograms: "Microsoft Learn, technical certifications",
      mentorship: "Strong mentorship culture"
    },
    interviewProcess: {
      rounds: ["Online assessment", "Technical interviews", "System design", "Behavioral interviews"],
      typicalDuration: "4-6 weeks",
      tips: ["Strong problem-solving skills", "Data structures knowledge", "System design principles"]
    }
  },
  {
    name: "Amazon",
    description: "Amazon is a multinational technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence.",
    headquarters: "Seattle, Washington, USA",
    industry: "E-commerce, Cloud Computing, Technology",
    founded: "1994",
    employeeCount: "1.5 million+",
    revenue: "$574.8 billion (2023)",
    website: "https://www.amazon.com",
    source: "database",
    culture: {
      workLifeBalance: "Fast-paced environment with high expectations",
      learningOpportunities: "Continuous learning and innovation encouraged",
      teamEnvironment: "Results-oriented with focus on customer obsession",
      values: ["Customer Obsession", "Ownership", "Invent and Simplify", "Learn and Be Curious", "Hire and Develop the Best"]
    },
    interviewProcess: {
      rounds: ["Online assessment", "Phone screens", "Technical rounds", "Bar raiser interview", "Leadership principle discussions"],
      typicalDuration: "3-6 weeks",
      tips: ["Study Amazon leadership principles", "Prepare STAR method answers", "Focus on customer-centric thinking"]
    }
  },
  {
    name: "Apple",
    description: "Apple Inc. is a multinational technology company that designs, develops, and sells consumer electronics, computer software, and online services. Known for its innovative products including iPhone, iPad, Mac, and services like App Store and Apple Music.",
    headquarters: "Cupertino, California, United States",
    industry: "Technology",
    founded: "1976",
    employeeCount: "164,000+",
    revenue: "$394.3 billion (2022)",
    website: "https://www.apple.com",
    source: "database",
    ceo: "Tim Cook",
    culture: {
      workLifeBalance: "High standards with good benefits",
      learningOpportunities: "Innovation-focused learning",
      teamEnvironment: "Secretive but collaborative",
      values: ["Innovation", "Quality", "Simplicity", "Privacy"]
    },
    benefits: {
      healthcare: "Comprehensive medical coverage",
      insurance: "Life and disability insurance",
      leaves: "Generous paid time off",
      additionalPerks: ["Employee discounts", "Stock purchase program", "Wellness programs"]
    },
    careerGrowth: {
      promotionOpportunities: "Merit-based advancement",
      trainingPrograms: "Technical and leadership development",
      mentorship: "Available for key roles"
    },
    interviewProcess: {
      rounds: ["Phone screening", "Technical interviews", "Team fit", "Design thinking"],
      typicalDuration: "4-8 weeks",
      tips: ["Focus on innovation", "Attention to detail", "User-centric thinking"]
    }
  },
  {
    name: "Wipro",
    description: "Wipro Limited is a leading global information technology, consulting and business process services company. Known for its comprehensive portfolio of services, strong commitment to sustainability and good corporate citizenship, Wipro has a dedicated workforce serving clients across six continents.",
    headquarters: "Bangalore, India",
    industry: "Information Technology",
    founded: "1945",
    employeeCount: "250,000+",
    revenue: "$10.4 billion (2022)",
    website: "https://www.wipro.com",
    source: "database",
    ceo: "Thierry Delaporte",
    culture: {
      workLifeBalance: "Good work-life balance policies",
      learningOpportunities: "Continuous learning environment",
      teamEnvironment: "Collaborative and inclusive",
      values: ["Spirit of Wipro", "Innovation", "Customer Focus", "Quality"]
    },
    benefits: {
      healthcare: "Comprehensive medical coverage",
      insurance: "Life and accident insurance",
      leaves: "Flexible leave policies",
      additionalPerks: ["Transport facilities", "Food subsidies", "Wellness programs"]
    },
    careerGrowth: {
      promotionOpportunities: "Regular career advancement",
      trainingPrograms: "Technical and soft skills training",
      mentorship: "Structured mentorship programs"
    },
    interviewProcess: {
      rounds: ["Online test", "Technical interview", "HR round", "Project manager round"],
      typicalDuration: "2-3 weeks",
      tips: ["Technical fundamentals", "Communication skills", "Problem-solving ability"]
    }
  },
  {
    name: "Cognizant",
    description: "Cognizant is a multinational information technology services and consulting company. It provides digital, technology, consulting, and operations services, helping clients envision, build and run more innovative and efficient businesses.",
    headquarters: "Teaneck, New Jersey, United States",
    industry: "Information Technology",
    founded: "1994",
    employeeCount: "350,000+",
    revenue: "$19.4 billion (2022)",
    website: "https://www.cognizant.com",
    source: "database",
    ceo: "Ravi Kumar S",
    culture: {
      workLifeBalance: "Good work-life balance",
      learningOpportunities: "Strong learning culture",
      teamEnvironment: "Global collaboration",
      values: ["Client First", "Innovation", "Integrity", "Excellence"]
    },
    benefits: {
      healthcare: "Comprehensive health coverage",
      insurance: "Life and disability insurance",
      leaves: "Flexible leave policies",
      additionalPerks: ["Transport allowance", "Food subsidy", "Wellness benefits"]
    },
    careerGrowth: {
      promotionOpportunities: "Regular advancement",
      trainingPrograms: "Extensive training",
      mentorship: "Available programs"
    },
    interviewProcess: {
      rounds: ["Online test", "Technical interview", "HR round", "Manager discussion"],
      typicalDuration: "2-4 weeks",
      tips: ["Technical expertise", "Communication skills", "Problem-solving"]
    }
  },
  {
    name: "Tesla",
    description: "Tesla, Inc. is an American multinational automotive and clean energy company that designs and manufactures electric vehicles, battery energy storage, solar panels and roof tiles, and related products and services.",
    headquarters: "Austin, Texas, USA",
    industry: "Automotive, Clean Energy",
    founded: "2003",
    employeeCount: "127,000+",
    revenue: "$96.8 billion (2023)",
    website: "https://www.tesla.com",
    source: "database",
    culture: {
      workLifeBalance: "Fast-paced, high-intensity work environment",
      learningOpportunities: "Innovative problem-solving and rapid development",
      teamEnvironment: "Mission-driven teams focused on sustainability",
      values: ["Accelerating the world's transition to sustainable energy", "Innovation", "Excellence", "Challenging the status quo"]
    },
    interviewProcess: {
      rounds: ["Initial screening", "Technical assessment", "Multiple panel interviews", "Problem-solving test"],
      typicalDuration: "2-6 weeks",
      tips: ["Show passion for Tesla's mission", "Demonstrate innovative thinking", "Highlight ability to work in fast-paced environments"]
    }
  },
  {
    name: "HCL Technologies",
    description: "HCL Technologies is a next-generation global technology company that helps enterprises reimagine their businesses for the digital age. With its extensive network of innovation labs and delivery centers worldwide, HCL offers an integrated portfolio of services underlined by its Mode 1-2-3 growth strategy.",
    headquarters: "Noida, India",
    industry: "Information Technology",
    founded: "1976",
    employeeCount: "210,000+",
    revenue: "$12.3 billion (2022)",
    website: "https://www.hcltech.com",
    source: "database",
    ceo: "C Vijayakumar",
    culture: {
      workLifeBalance: "Flexible work arrangements",
      learningOpportunities: "HCL TechBee program",
      teamEnvironment: "Global collaborative environment",
      values: ["Trust", "Transparency", "Value Centricity", "Innovation"]
    },
    benefits: {
      healthcare: "Comprehensive health benefits",
      insurance: "Life and accident coverage",
      leaves: "Liberal leave policy",
      additionalPerks: ["Flexible benefits", "Learning allowance", "Wellness programs"]
    },
    careerGrowth: {
      promotionOpportunities: "Regular growth opportunities",
      trainingPrograms: "Technical and leadership training",
      mentorship: "Structured mentoring"
    },
    interviewProcess: {
      rounds: ["Aptitude test", "Technical rounds", "HR interview", "Manager round"],
      typicalDuration: "2-4 weeks",
      tips: ["Technical knowledge", "Communication skills", "Domain expertise"]
    }
  },
  {
    name: "Meta",
    description: "Meta (formerly Facebook) is a technology company focused on building technologies that help people connect, find communities, and grow businesses. The company owns popular platforms including Facebook, Instagram, WhatsApp, and develops virtual and augmented reality products.",
    headquarters: "Menlo Park, California, United States",
    industry: "Technology",
    founded: "2004",
    employeeCount: "87,000+",
    revenue: "$116.61 billion (2022)",
    website: "https://about.meta.com",
    source: "database",
    ceo: "Mark Zuckerberg",
    culture: {
      workLifeBalance: "Fast-paced with good benefits",
      learningOpportunities: "Cutting-edge tech exposure",
      teamEnvironment: "Move fast with stable infra",
      values: ["Move Fast", "Be Bold", "Focus on Impact", "Build Social Value"]
    },
    benefits: {
      healthcare: "Comprehensive health coverage",
      insurance: "Life and disability insurance",
      leaves: "Generous paid time off",
      additionalPerks: ["Free meals", "Wellness allowance", "Family planning support"]
    },
    careerGrowth: {
      promotionOpportunities: "Performance-based growth",
      trainingPrograms: "Technical and leadership tracks",
      mentorship: "Strong mentorship culture"
    },
    interviewProcess: {
      rounds: ["Initial screen", "Technical interviews", "System design", "Behavioral"],
      typicalDuration: "4-8 weeks",
      tips: ["Strong coding skills", "System design knowledge", "Meta's values"]
    }
  },
  {
    name: "Tech Mahindra",
    description: "Tech Mahindra is a leading provider of digital transformation, consulting, and business re-engineering services and solutions. The company is part of the Mahindra Group and provides innovative and customer-centric digital experiences.",
    headquarters: "Pune, India",
    industry: "Information Technology",
    founded: "1986",
    employeeCount: "150,000+",
    revenue: "$6.3 billion (2022)",
    website: "https://www.techmahindra.com",
    source: "database",
    ceo: "CP Gurnani",
    culture: {
      workLifeBalance: "Balanced work environment",
      learningOpportunities: "Continuous learning focus",
      teamEnvironment: "Collaborative and diverse",
      values: ["Customer First", "Innovation", "Excellence", "Integrity"]
    },
    benefits: {
      healthcare: "Comprehensive medical coverage",
      insurance: "Life and accident insurance",
      leaves: "Flexible leave policy",
      additionalPerks: ["Transport facility", "Food subsidy", "Wellness programs"]
    },
    careerGrowth: {
      promotionOpportunities: "Regular growth paths",
      trainingPrograms: "Technical and soft skills",
      mentorship: "Structured programs"
    },
    interviewProcess: {
      rounds: ["Online assessment", "Technical rounds", "HR interview", "Manager round"],
      typicalDuration: "2-3 weeks",
      tips: ["Technical skills", "Communication", "Domain knowledge"]
    }
  },
  {
    name: "Adobe",
    description: "Adobe Inc. is a multinational computer software company known for its multimedia and creativity software products. Creator of popular products like Photoshop, Illustrator, and the PDF format, Adobe is a leader in digital media and digital marketing solutions.",
    headquarters: "San Jose, California, United States",
    industry: "Technology",
    founded: "1982",
    employeeCount: "29,000+",
    revenue: "$17.61 billion (2022)",
    website: "https://www.adobe.com",
    source: "database",
    ceo: "Shantanu Narayen",
    culture: {
      workLifeBalance: "Strong work-life balance",
      learningOpportunities: "Innovation-focused",
      teamEnvironment: "Creative and collaborative",
      values: ["Genuine", "Exceptional", "Innovative", "Involved"]
    },
    benefits: {
      healthcare: "Comprehensive coverage",
      insurance: "Life and disability",
      leaves: "Generous time off",
      additionalPerks: ["Stock purchase plan", "Sabbatical", "Education reimbursement"]
    },
    careerGrowth: {
      promotionOpportunities: "Regular growth",
      trainingPrograms: "Technical and leadership",
      mentorship: "Strong programs"
    },
    interviewProcess: {
      rounds: ["Phone screen", "Technical rounds", "Design/coding", "Team fit"],
      typicalDuration: "3-6 weeks",
      tips: ["Creative thinking", "Technical skills", "Innovation focus"]
    }
  },
  {
    name: "Capgemini",
    description: "Capgemini is a global leader in consulting, technology services and digital transformation. The company helps organizations realize their business ambitions through an array of services from strategy to operations.",
    headquarters: "Paris, France",
    industry: "Information Technology",
    founded: "1967",
    employeeCount: "340,000+",
    revenue: "€21.9 billion (2022)",
    website: "https://www.capgemini.com",
    source: "database",
    ceo: "Aiman Ezzat",
    culture: {
      workLifeBalance: "Good balance",
      learningOpportunities: "Extensive training",
      teamEnvironment: "Global collaboration",
      values: ["Honesty", "Boldness", "Trust", "Freedom"]
    },
    benefits: {
      healthcare: "Comprehensive coverage",
      insurance: "Life and disability",
      leaves: "Flexible policies",
      additionalPerks: ["Training programs", "Global mobility", "Wellness benefits"]
    },
    careerGrowth: {
      promotionOpportunities: "Clear paths",
      trainingPrograms: "Multiple options",
      mentorship: "Available"
    },
    interviewProcess: {
      rounds: ["Online assessment", "Technical rounds", "HR discussion", "Final interview"],
      typicalDuration: "3-4 weeks",
      tips: ["Technical skills", "Communication", "Cultural fit"]
    }
  },
  {
    name: "Salesforce",
    description: "Salesforce is a global leader in customer relationship management (CRM) software and enterprise cloud computing solutions. The company revolutionized the way companies manage customer relationships through its innovative cloud-based CRM platform.",
    headquarters: "San Francisco, California, United States",
    industry: "Technology",
    founded: "1999",
    employeeCount: "79,000+",
    revenue: "$31.4 billion (2022)",
    website: "https://www.salesforce.com",
    source: "database",
    ceo: "Marc Benioff",
    culture: {
      workLifeBalance: "Strong work-life balance",
      learningOpportunities: "Trailhead learning platform",
      teamEnvironment: "Ohana culture",
      values: ["Trust", "Customer Success", "Innovation", "Equality"]
    },
    benefits: {
      healthcare: "Comprehensive coverage",
      insurance: "Life and disability",
      leaves: "Generous time off",
      additionalPerks: ["Volunteer time off", "Education reimbursement", "Wellness benefits"]
    },
    careerGrowth: {
      promotionOpportunities: "Regular advancement",
      trainingPrograms: "Extensive Trailhead courses",
      mentorship: "Strong programs"
    },
    interviewProcess: {
      rounds: ["Initial screen", "Technical rounds", "Team fit", "Values assessment"],
      typicalDuration: "3-5 weeks",
      tips: ["Salesforce knowledge", "Technical skills", "Cultural alignment"]
    }
  },
  {
    name: "Oracle",
    description: "Oracle Corporation is a multinational technology company known for its database software, cloud engineered systems, and enterprise software products. The company is a leading provider of business software, cloud infrastructure, and platform services.",
    headquarters: "Austin, Texas, United States",
    industry: "Technology",
    founded: "1977",
    employeeCount: "143,000+",
    revenue: "$42.4 billion (2022)",
    website: "https://www.oracle.com",
    source: "database",
    ceo: "Safra Catz",
    culture: {
      workLifeBalance: "Professional environment",
      learningOpportunities: "Oracle University",
      teamEnvironment: "Results-oriented",
      values: ["Innovation", "Customer Focus", "Excellence", "Integrity"]
    },
    benefits: {
      healthcare: "Comprehensive coverage",
      insurance: "Life and disability",
      leaves: "Competitive PTO",
      additionalPerks: ["401(k) matching", "Education benefits", "Employee discounts"]
    },
    careerGrowth: {
      promotionOpportunities: "Merit-based",
      trainingPrograms: "Technical and soft skills",
      mentorship: "Available"
    },
    interviewProcess: {
      rounds: ["Phone screen", "Technical assessment", "Panel interview", "Manager round"],
      typicalDuration: "3-6 weeks",
      tips: ["Database knowledge", "Technical expertise", "Problem-solving"]
    }
  },
  {
    name: "Razorpay",
    description: "Razorpay is India's leading full-stack financial solutions company. The company provides payment gateway services, business banking solutions, and various other financial technology products to businesses across India.",
    headquarters: "Bangalore, India",
    industry: "Financial Technology",
    founded: "2014",
    employeeCount: "2,000+",
    revenue: "$60+ million (2022)",
    website: "https://razorpay.com",
    source: "database",
    ceo: "Harshil Mathur",
    culture: {
      workLifeBalance: "Startup culture",
      learningOpportunities: "Fast-paced learning",
      teamEnvironment: "Young and dynamic",
      values: ["Innovation", "Customer First", "Ownership", "Transparency"]
    },
    benefits: {
      healthcare: "Comprehensive coverage",
      insurance: "Health and life",
      leaves: "Flexible policy",
      additionalPerks: ["ESOP", "Learning allowance", "Wellness benefits"]
    },
    careerGrowth: {
      promotionOpportunities: "Fast growth",
      trainingPrograms: "Technical and domain",
      mentorship: "Available"
    },
    interviewProcess: {
      rounds: ["Technical assessment", "System design", "Culture fit", "Final discussion"],
      typicalDuration: "2-3 weeks",
      tips: ["Fintech knowledge", "System design", "Problem-solving"]
    }
  },
  {
    name: "Swiggy",
    description: "Swiggy is India's leading on-demand delivery platform connecting consumers with restaurants and stores. The company has revolutionized food delivery in India and expanded into quick commerce with Instamart.",
    headquarters: "Bangalore, India",
    industry: "Technology, Food Delivery",
    founded: "2014",
    employeeCount: "5,000+",
    revenue: "$1.3 billion (2022)",
    website: "https://www.swiggy.com",
    source: "database",
    ceo: "Sriharsha Majety",
    culture: {
      workLifeBalance: "Fast-paced startup",
      learningOpportunities: "Rapid growth",
      teamEnvironment: "Innovation-focused",
      values: ["Customer First", "Innovation", "Execution Excellence", "Ownership"]
    },
    benefits: {
      healthcare: "Comprehensive coverage",
      insurance: "Health and accident",
      leaves: "Flexible policy",
      additionalPerks: ["ESOP", "Food allowance", "Learning benefits"]
    },
    careerGrowth: {
      promotionOpportunities: "Quick growth",
      trainingPrograms: "Role-specific",
      mentorship: "Available"
    },
    interviewProcess: {
      rounds: ["Technical/Role assessment", "Problem solving", "Culture fit", "Leadership round"],
      typicalDuration: "2-3 weeks",
      tips: ["Domain knowledge", "Problem-solving", "Startup mindset"]
    }
  },
  {
    name: "NVIDIA",
    description: "NVIDIA is a technology company known for designing graphics processing units (GPUs) for gaming and professional markets, as well as system on chip units (SoCs) for the mobile computing and automotive market. The company is a leader in AI computing.",
    headquarters: "Santa Clara, California, United States",
    industry: "Technology, Semiconductors",
    founded: "1993",
    employeeCount: "22,000+",
    revenue: "$26.91 billion (2022)",
    website: "https://www.nvidia.com",
    source: "database",
    ceo: "Jensen Huang",
    culture: {
      workLifeBalance: "Innovation-focused",
      learningOpportunities: "Cutting-edge tech",
      teamEnvironment: "Research-oriented",
      values: ["Innovation", "Intellectual Honesty", "Speed", "Excellence"]
    },
    benefits: {
      healthcare: "Comprehensive coverage",
      insurance: "Life and disability",
      leaves: "Competitive policy",
      additionalPerks: ["Stock options", "Education benefits", "Fitness allowance"]
    },
    careerGrowth: {
      promotionOpportunities: "Merit-based",
      trainingPrograms: "Technical focus",
      mentorship: "Available"
    },
    interviewProcess: {
      rounds: ["Technical screen", "Coding/Architecture", "Team interviews", "Final round"],
      typicalDuration: "4-6 weeks",
      tips: ["GPU knowledge", "Algorithm expertise", "System architecture"]
    }
  },
  {
    name: "Zomato",
    description: "Zomato is a technology platform that connects customers, restaurant partners and delivery partners, serving their multiple needs. The company has revolutionized the way people discover and experience food in India and several other countries.",
    headquarters: "Gurugram, India",
    industry: "Technology, Food Delivery",
    founded: "2008",
    employeeCount: "3,000+",
    revenue: "$1.8 billion (2022)",
    website: "https://www.zomato.com",
    source: "database",
    ceo: "Deepinder Goyal",
    culture: {
      workLifeBalance: "Fast-paced environment",
      learningOpportunities: "Rapid growth",
      teamEnvironment: "Dynamic startup",
      values: ["Customer Obsession", "Innovation", "Entrepreneurial", "Execution"]
    },
    benefits: {
      healthcare: "Comprehensive coverage",
      insurance: "Health and accident",
      leaves: "Flexible policy",
      additionalPerks: ["ESOP", "Food credits", "Wellness allowance"]
    },
    careerGrowth: {
      promotionOpportunities: "Fast track growth",
      trainingPrograms: "Role-specific",
      mentorship: "Available"
    },
    interviewProcess: {
      rounds: ["Technical/Role assessment", "Problem solving", "Culture fit", "Leadership discussion"],
      typicalDuration: "2-3 weeks",
      tips: ["Domain expertise", "Problem-solving", "Startup mindset"]
    }
  },
  {
    name: "Intel",
    description: "Intel Corporation is a world leader in the design and manufacturing of essential technologies and platforms for cloud computing, AI, and smart and connected devices. The company creates world-changing technology that improves the life of every person on the planet.",
    headquarters: "Santa Clara, California, United States",
    industry: "Technology, Semiconductors",
    founded: "1968",
    employeeCount: "131,900+",
    revenue: "$63.1 billion (2022)",
    website: "https://www.intel.com",
    source: "database",
    ceo: "Pat Gelsinger",
    culture: {
      workLifeBalance: "Professional environment",
      learningOpportunities: "Advanced technology",
      teamEnvironment: "Research-driven",
      values: ["Quality", "Innovation", "Great Place to Work", "Inclusion"]
    },
    benefits: {
      healthcare: "Comprehensive coverage",
      insurance: "Life and disability",
      leaves: "Competitive policy",
      additionalPerks: ["Bonuses", "Stock options", "Education benefits"]
    },
    careerGrowth: {
      promotionOpportunities: "Structured growth",
      trainingPrograms: "Technical and leadership",
      mentorship: "Formal programs"
    },
    interviewProcess: {
      rounds: ["Technical screen", "Design/Architecture", "Team interviews", "Manager round"],
      typicalDuration: "4-6 weeks",
      tips: ["Hardware knowledge", "System architecture", "Problem-solving"]
    }
  },
  {
    name: "Flipkart",
    description: "Flipkart is India's leading e-commerce marketplace with over 400 million registered users. The company revolutionized online shopping in India and continues to innovate in areas like supply chain, technology, and customer experience.",
    headquarters: "Bangalore, India",
    industry: "E-commerce, Technology",
    founded: "2007",
    employeeCount: "17,000+",
    revenue: "$23 billion (2022)",
    website: "https://www.flipkart.com",
    source: "database",
    ceo: "Kalyan Krishnamurthy",
    culture: {
      workLifeBalance: "Fast-paced environment",
      learningOpportunities: "Innovation focus",
      teamEnvironment: "Dynamic and collaborative",
      values: ["Customer First", "Innovation", "Bias for Action", "Ownership"]
    },
    benefits: {
      healthcare: "Comprehensive coverage",
      insurance: "Health and life",
      leaves: "Flexible policy",
      additionalPerks: ["ESOP", "Shopping benefits", "Learning allowance"]
    },
    careerGrowth: {
      promotionOpportunities: "Merit-based growth",
      trainingPrograms: "Technical and leadership",
      mentorship: "Available"
    },
    interviewProcess: {
      rounds: ["Online assessment", "Technical rounds", "System design", "Leadership round"],
      typicalDuration: "3-4 weeks",
      tips: ["E-commerce knowledge", "System design", "Problem-solving"]
    }
  },
  {
    name: "Samsung Electronics",
    description: "Samsung Electronics is a global leader in technology, opening new possibilities for people everywhere. Through relentless innovation and discovery, the company is transforming the worlds of TVs, smartphones, wearable devices, tablets, digital appliances, network systems, memory, system LSI, foundry and LED solutions.",
    headquarters: "Suwon, South Korea",
    industry: "Technology, Consumer Electronics",
    founded: "1969",
    employeeCount: "267,937+",
    revenue: "$244.2 billion (2022)",
    website: "https://www.samsung.com",
    source: "database",
    ceo: "Jong-Hee Han",
    culture: {
      workLifeBalance: "Professional environment",
      learningOpportunities: "Global exposure",
      teamEnvironment: "Innovation-focused",
      values: ["People", "Excellence", "Change", "Integrity", "Co-prosperity"]
    },
    benefits: {
      healthcare: "Comprehensive coverage",
      insurance: "Life and disability",
      leaves: "Competitive policy",
      additionalPerks: ["Product discounts", "Global opportunities", "Wellness programs"]
    },
    careerGrowth: {
      promotionOpportunities: "Structured growth",
      trainingPrograms: "Technical and leadership",
      mentorship: "Available"
    },
    interviewProcess: {
      rounds: ["Technical assessment", "Role-specific interview", "Team fit", "Final round"],
      typicalDuration: "4-6 weeks",
      tips: ["Technical expertise", "Innovation mindset", "Global perspective"]
    }
  },
  {
    name: "VMware",
    description: "VMware is a leading provider of multi-cloud services for all apps, enabling digital innovation with enterprise control. The company provides cloud infrastructure, modern applications, networking, security, and digital workspace solutions.",
    headquarters: "Palo Alto, California, United States",
    industry: "Technology, Cloud Computing",
    founded: "1998",
    employeeCount: "37,500+",
    revenue: "$13.35 billion (2022)",
    website: "https://www.vmware.com",
    source: "database",
    ceo: "Raghu Raghuram",
    culture: {
      workLifeBalance: "Good balance",
      learningOpportunities: "Technical excellence",
      teamEnvironment: "Collaborative",
      values: ["Innovation", "Customer First", "Execution", "Community"]
    },
    benefits: {
      healthcare: "Comprehensive coverage",
      insurance: "Life and disability",
      leaves: "Flexible policy",
      additionalPerks: ["Stock purchase plan", "Education benefits", "Wellness programs"]
    },
    careerGrowth: {
      promotionOpportunities: "Merit-based",
      trainingPrograms: "Technical and soft skills",
      mentorship: "Available"
    },
    interviewProcess: {
      rounds: ["Technical screen", "Coding/System design", "Team interviews", "Manager round"],
      typicalDuration: "3-5 weeks",
      tips: ["Virtualization knowledge", "System design", "Problem-solving"]
    }
  }
];

export async function seedCompanies(updateExisting = false) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if we already have companies in the database
    const existingCount = await Company.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing companies in the database.`);
      
      if (updateExisting) {
        console.log('Update mode: Will update existing companies with new information...');
      } else {
        console.log('Add mode: Adding only new companies without updating existing ones...');
      }
      
      // Track statistics
      let added = 0;
      let updated = 0;
      let skipped = 0;
      
      // Process each company
      for (const company of companies) {
        // Check if company already exists (case-insensitive)
        const exists = await Company.findOne({ 
          name: { $regex: new RegExp(`^${company.name}$`, 'i') } 
        });
        
        if (exists) {
          if (updateExisting) {
            // Update existing company with new data
            // We use findOneAndUpdate to maintain the _id and other fields not specified here
            await Company.findOneAndUpdate(
              { _id: exists._id },
              { ...company, lastUpdated: new Date() },
              { new: true }
            );
            console.log(`Updated existing company: ${company.name}`);
            updated++;
          } else {
            console.log(`Company "${company.name}" already exists, skipping...`);
            skipped++;
          }
        } else {
          // Add new company
          await Company.create(company);
          console.log(`Added new company: ${company.name}`);
          added++;
        }
      }
      
      if (updateExisting) {
        console.log(`Seeding results: ${added} companies added, ${updated} companies updated.`);
      } else {
        console.log(`Seeding results: ${added} companies added, ${skipped} skipped (already exist).`);
      }
    } else {
      console.log('No existing companies found. Performing initial seeding...');
      
      // Insert all companies
      await Company.insertMany(companies);
      console.log(`Inserted ${companies.length} companies into empty database.`);
    }

    // Close the connection properly
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    
    return {
      success: true,
      message: 'Company seeding completed successfully'
    };
  } catch (error) {
    console.error('Error seeding companies:', error);
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Disconnected from MongoDB after error');
    }
    return {
      success: false,
      error: error.message
    };
  }
}

// Run directly if this script is executed directly
if (process.argv[1].includes('seedCompanies.js')) {
  // Check if update flag is passed
  const updateMode = process.argv.includes('--update');
  
  seedCompanies(updateMode)
    .then(result => {
      if (result.success) {
        console.log('✅ ' + result.message);
        process.exit(0);
      } else {
        console.error('❌ Error: ' + result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
} 