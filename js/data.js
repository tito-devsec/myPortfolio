/* ============================================================
   SITE DATA — everything that changes lives here.
   The admin panel (next step) will produce exactly this shape.
   Page copy (headings, paragraphs) stays in the HTML files.
   ============================================================ */
window.SITE = {
  // Backend base URL once the admin/API exists, e.g. 'https://api.titodevsec.com/api'.
  // Empty = no backend: the contact form opens the visitor's email app instead.
  api: '',

  profile: {
    name: 'Tito Oscar Mwaisengela',
    brand: 'Titodevsec',
    city: 'Dar es Salaam, Tanzania',
    timezone: 'Africa/Dar_es_Salaam',
    gmt: 'GMT+3',
    email: 'contact@titodevsec.com',
    discord: 'titodevsec',
    availability: 'Open for freelance work',
    avatar: 'images/profile.jpeg',
    // Hero figure: a PNG cut-out with a TRANSPARENT background (e.g. made with remove.bg).
    // Leave empty to show the plain grey hero. images/tito-hero.png currently has a solid
    // black background, so it is switched off until you replace it with your own cut-out.
    heroImage: '',
  },

  // Preloader greetings (home page). First one holds longer, the rest flick by.
  greetings: ['Habari', 'Hello', 'Bonjour', 'Ciao', 'Olà', 'やあ', 'مرحبا', 'Hallå', 'Guten tag', 'Hallo'],

  // Leave url empty to show the label without a link.
  socials: [
    { label: 'GitHub', url: 'https://github.com/tito-devsec' },
    { label: 'Instagram', url: '' },
    { label: 'Twitter', url: '' },
    { label: 'LinkedIn', url: '' },
  ],

  // Filter buttons on the work page (only categories that exist are shown).
  workFilters: ['Design', 'Development', 'Security'],

  // Sample projects — replace with real work (or manage them through the admin later).
  // Order matters: the first four appear on the home page; "next case" follows this order.
  projects: [
    {
      slug: 'secureauth-portal',
      title: 'SecureAuth Portal',
      category: 'Development',
      services: 'Design & Development',
      tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      year: '2024',
      location: 'Tanzania',
      color: '#e4e5e7',
      cover: 'images/work/secureauth-portal.svg',
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
      cover: 'images/work/threatmonitor.svg',
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
      cover: 'images/work/devsecops-pipeline.svg',
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
      cover: 'images/work/pentest-framework.svg',
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
      cover: 'images/work/campus-connect.svg',
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
      cover: 'images/work/cryptovault.svg',
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
