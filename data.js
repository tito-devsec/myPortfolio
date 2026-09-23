/* ============================================================
   SITE DATA — everything that changes lives here.
   The admin panel (next step) will produce exactly this shape.
   Page copy (headings, paragraphs) stays in the HTML files.

   All files sit in ONE folder, so a path is just the file name
   (e.g. 'moranai-hero.png'). Avoid spaces in file names.
   ============================================================ */

// Unsplash CDN helper for the sample photos (free to use, no attribution required).
// Replace any of these with your own screenshots, e.g. 'my-project-1.jpg'.
const U = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

window.SITE = {
  // Backend base URL once the admin/API exists, e.g. 'https://api.titodevsec.online/api'.
  // Empty = no backend: the contact form opens the visitor's email app instead.
  api: '',

  profile: {
    name: 'Tito Oscar Mwaisengela',
    brand: 'Titodevsec',
    city: 'Dar es Salaam, Tanzania',
    timezone: 'Africa/Dar_es_Salaam',
    gmt: 'GMT+3',
    email: 'titomwaisengela@gmail.com',
    discord: 'titodevsec',
    availability: 'Open for freelance work',
    avatar: 'profile.jpeg',
    // Hero figure: a PNG cut-out with a TRANSPARENT background. Leave empty for the plain grey hero.
    heroImage: '',   // set to 'hero.png' to show the figure again
    // Rotation applied to the figure in degrees (negative = counter-clockwise) to stand it upright.
    // Set to 0 once the image file itself is upright.
    heroRotate: -24,
  },

  // 3D laptop on case pages with a video (MacBook Air M4 model).
  // finish: 'silver' | 'starlight' | 'skyblue' | 'midnight' | 'spacegrey'
  laptop: { finish: 'silver' },

  // Preloader greetings (home page). First one holds longer, the rest flick by.
  greetings: ['Habari', 'Hello', 'Bonjour', 'Ciao', 'Olà', 'やあ', 'مرحبا', 'Hallå', 'Guten tag', 'Hallo'],

  // Leave url empty to show the label without a link.
  socials: [
    { label: 'GitHub', url: 'https://github.com/tito-devsec' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/tito-mwaisengela-b31595434/' },
    // Add more the same way, e.g. { label: 'Instagram', url: 'https://instagram.com/…' }
  ],

  // Filter buttons on the work page (only categories that exist are shown).
  workFilters: ['Design', 'Development', 'Security'],

  // Order matters: the first four appear on the home page; "next case" follows this order.
  // `cover` is used in the hover preview, cards, case hero and laptop frame.
  // `placeholder` is a local drawing shown automatically if the cover fails to load.
  // `images` is the case-page gallery: { src, alt, caption, fallback }.
  // `video` swaps the flat frame for the scroll-animated 3D laptop.
  projects: [
    // ── Real work ──────────────────────────────────────────────────────────
    {
      slug: 'moranai',
      title: 'Moran AI',
      category: 'Development',
      services: 'Design & Development',
      tech: [],                 // TODO: e.g. ['Next.js', 'Node.js', 'WhatsApp Business API']
      year: '2026',
      location: 'Dar es Salaam, Tanzania',
      color: '#dff3ea',
      cover: 'moranai-hero.png',
      placeholder: 'moranai.svg',
      // Screen recording shown inside the scroll-animated 3D laptop on the case page.
      video: { src: 'moranai-demo.mp4', poster: 'moranai-hero.png' },
      images: [
        { src: 'moranai-stats.png', alt: 'Why businesses choose Moran AI: 5k+ businesses, 1M+ conversations, 24/7 coverage' },
        { src: 'moranai-agents.png', alt: 'Customer dashboard: Moran agents (Sales, Lead Qualification, Support, Booking)' },
        { src: 'moranai-footer.png', alt: 'Call to action and site footer' },
        // moranai-chat.png shows customer names and a phone number. Blur them first, then uncomment:
        // { src: 'moranai-chat.png', alt: 'Dashboard: chat and human handover' },
      ],
      description: 'Moran AI gives businesses an intelligent sales and support agent on WhatsApp: it answers customers in Swahili and English, captures leads, takes orders and bookings and hands over to a human whenever needed. The product spans the public site and the customer dashboard: agent workspace, chat and handover, leads, campaign engine, orders, voice assistance, social media manager and a knowledge base.',
      live: 'https://moranai.co.tz',
      github: '',
    },
    {
      slug: 'weare-moranai',
      title: 'Moran AI Admin',
      category: 'Development',
      services: 'Development & Security',
      tech: [],                 // TODO
      year: '2026',
      location: 'Dar es Salaam, Tanzania',
      color: '#0f2b21',
      cover: 'weare-overview.png',
      placeholder: 'weare-moranai.svg',
      images: [
        { src: 'weare-login.png', alt: 'Two-factor login with an authenticator code' },
        // weare-users.png shows admin names and email addresses. Blur them first, then uncomment:
        // { src: 'weare-users.png', alt: 'Users and roles: admins, owners, permissions, sign-in activity' },
      ],
      description: 'Internal operations console for the Moran AI platform at weare.moranai.co.tz. It tracks revenue, AI cost, businesses, agents and conversations at a glance, manages WhatsApp channels, campaigns and support, and is protected by two-factor login with granular roles, permissions, sign-in activity and audit logs.',
      live: 'https://weare.moranai.co.tz',
      github: '',
    },

    // ── Sample projects (replace or delete) ────────────────────────────────
    {
      slug: 'secureauth-portal',
      title: 'SecureAuth Portal',
      category: 'Development',
      services: 'Design & Development',
      tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      year: '2024',
      location: 'Tanzania',
      color: '#e4e5e7',
      cover: U('1555949963-aa79dcee981c'),
      placeholder: 'secureauth-portal.svg',
      images: [
        { src: U('1498050108023-c5249f4df085'), alt: 'Application code on a laptop', fallback: 'secureauth-portal-2.svg' },
        { src: U('1563986768609-322da13575f3', 1200), alt: 'Security lock illustration', fallback: 'secureauth-portal-3.svg' },
        { src: U('1517694712202-14dd9538aa97'), alt: 'Developer workstation', fallback: 'secureauth-portal.svg' },
      ],
      description: 'Enterprise authentication portal with multi-factor login, session hardening, rate limiting and full OWASP compliance. Built end to end: from the design system to the API and deployment.',
      live: '',
      github: '',
    },
    {
      slug: 'threatmonitor',
      title: 'ThreatMonitor',
      category: 'Security',
      services: 'Security & Development',
      tech: ['Python', 'Flask', 'React', 'Redis'],
      year: '2024',
      location: 'Tanzania',
      color: '#8c8c8c',
      cover: U('1551288049-bebda4e38f71'),
      placeholder: 'threatmonitor.svg',
      images: [
        { src: U('1526374965328-7f61d4dc18c5'), alt: 'Streams of code on a dark screen', fallback: 'threatmonitor-2.svg' },
        { src: U('1460925895917-afdab827c52f', 1200), alt: 'Analytics charts on a laptop', fallback: 'threatmonitor-3.svg' },
        { src: U('1544197150-b99a580bb7a8'), alt: 'Server room', fallback: 'threatmonitor.svg' },
      ],
      description: 'Real-time cybersecurity monitoring dashboard that aggregates logs, detects anomalies and pushes automated alerts to the response team.',
      live: '',
      github: '',
    },
    {
      slug: 'devsecops-pipeline',
      title: 'DevSecOps Pipeline',
      category: 'Development',
      services: 'Development',
      tech: ['Docker', 'GitHub Actions', 'Terraform', 'AWS'],
      year: '2023',
      location: 'Remote',
      color: '#c3cbc7',
      cover: U('1461749280684-dccba630e2f6'),
      placeholder: 'devsecops-pipeline.svg',
      images: [
        { src: U('1544197150-b99a580bb7a8'), alt: 'Data centre racks', fallback: 'devsecops-pipeline-2.svg' },
        { src: U('1555066931-4365d14bab8c', 1200), alt: 'Source code on a monitor', fallback: 'devsecops-pipeline-3.svg' },
        { src: U('1510915228340-29c85a43dcfe'), alt: 'Laptop with terminal and coffee', fallback: 'devsecops-pipeline.svg' },
      ],
      description: 'Automated CI/CD pipeline with integrated security scanning, dependency auditing and compliance reporting, so every release ships secure by default.',
      live: '',
      github: '',
    },
    {
      slug: 'pentest-framework',
      title: 'PenTest Framework',
      category: 'Security',
      services: 'Security',
      tech: ['Python', 'Bash', 'Nmap'],
      year: '2023',
      location: 'Tanzania',
      color: '#706d63',
      cover: U('1550751827-4bd374c3f58b'),
      placeholder: 'pentest-framework.svg',
      images: [
        { src: U('1555066931-4365d14bab8c'), alt: 'Code on screen', fallback: 'pentest-framework-2.svg' },
        { src: U('1518770660439-4636190af475', 1200), alt: 'Circuit board close-up', fallback: 'pentest-framework-3.svg' },
        { src: U('1526374965328-7f61d4dc18c5'), alt: 'Code streams', fallback: 'pentest-framework.svg' },
      ],
      description: 'Custom penetration-testing toolkit that chains reconnaissance, scanning and reporting into one repeatable workflow for security assessments.',
      live: '',
      github: '',
    },
    {
      slug: 'campus-connect',
      title: 'Campus Connect',
      category: 'Design',
      services: 'Design & Development',
      tech: ['Next.js', 'Supabase', 'TailwindCSS'],
      year: '2022',
      location: 'Dar es Salaam',
      color: '#efe8d3',
      cover: U('1522202176988-66273c2fd55f'),
      placeholder: 'campus-connect.svg',
      images: [
        { src: U('1523240795612-9a054b0db644'), alt: 'Students studying together', fallback: 'campus-connect-2.svg' },
        { src: U('1504384308090-c894fdcc538d', 1200), alt: 'Team working on laptops', fallback: 'campus-connect-3.svg' },
        { src: U('1498050108023-c5249f4df085'), alt: 'Building the app', fallback: 'campus-connect.svg' },
      ],
      description: 'University platform connecting students, clubs and events at UDSM, designed for quick discovery and built for thousands of concurrent users.',
      live: '',
      github: '',
    },
    {
      slug: 'cryptovault',
      title: 'CryptoVault',
      category: 'Development',
      services: 'Design & Development',
      tech: ['React', 'Node.js', 'MongoDB'],
      year: '2022',
      location: 'Remote',
      color: '#d5dbe0',
      cover: U('1518546305927-5a555bb7020d'),
      placeholder: 'cryptovault.svg',
      images: [
        { src: U('1556742049-0cfed4f6a45d'), alt: 'Online payment with a card and laptop', fallback: 'cryptovault-2.svg' },
        { src: U('1518770660439-4636190af475', 1200), alt: 'Hardware close-up', fallback: 'cryptovault-3.svg' },
        { src: U('1551288049-bebda4e38f71'), alt: 'Portfolio dashboard', fallback: 'cryptovault.svg' },
      ],
      description: 'Secure digital-asset management app with multi-factor authentication, cold-storage integration and audited transaction flows.',
      live: '',
      github: '',
    },
  ],

  // About page: "I can help you with …"
  services: [
    { title: 'Full-Stack Dev', text: 'I build complete web applications from front to back: pixel-perfect interfaces, efficient and scalable APIs, clean data models. React, Next.js, Node, Python and Laravel are my daily tools.' },
    { title: 'Cybersecurity', text: 'Certified Advanced Penetration Tester with hands-on experience in OWASP, Burp Suite and vulnerability assessments. I find the weak spots before someone else does and help you fix them.' },
    { title: 'The full package', star: true, text: 'A complete system from concept to deployment: designed, built, tested and hardened. Combining development and security in one person is what sets my work apart.' },
  ],

  // About page: tech stack grid
  stack: [
    { label: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'PHP'] },
    { label: 'Frontend', items: ['React.js', 'Next.js', 'React Native', 'TailwindCSS', 'GSAP'] },
    { label: 'Backend', items: ['Node.js', 'Express', 'Laravel', 'Django', 'Flask'] },
    { label: 'Databases', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Firebase', 'Supabase'] },
    { label: 'DevOps & Tools', items: ['Docker', 'Git', 'Nginx', 'CI/CD', 'Linux', 'AWS'] },
    { label: 'Security', items: ['OWASP', 'Burp Suite', 'Nmap', 'Wireshark', 'Cryptography', 'Pen Testing'] },
  ],
};
