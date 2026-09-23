/* ============================================================
   SITE DATA — everything that changes lives here.
   The admin panel (next step) will produce exactly this shape.
   Page copy (headings, paragraphs) stays in the HTML files.
   ============================================================ */

// Unsplash CDN helper for the sample photos (free to use, no attribution required).
// Replace any of these with your own screenshots, e.g. 'images/work/my-project-1.jpg'.
const U = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

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
    email: 'titomwaisengela@gmail.com',
    discord: 'titodevsec',
    availability: 'Open for freelance work',
    avatar: 'images/profile.jpeg',
    // Hero figure: a PNG cut-out with a TRANSPARENT background. Leave empty for the plain grey hero.
    heroImage: '',   // set to 'images/hero.png' to show the figure again
    // Rotation applied to the figure in degrees (negative = counter-clockwise) to stand it upright.
    // Set to 0 once the image file itself is upright.
    heroRotate: -24,
  },

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

  // Sample projects — replace with real work (or manage them through the admin later).
  // Order matters: the first four appear on the home page; "next case" follows this order.
  // `cover` is used in the hover preview, cards, case hero and laptop frame.
  // `placeholder` is a local drawing shown automatically if the cover fails to load.
  // `images` is the case-page gallery: { src, alt, caption, fallback } or { type: 'video', src, poster }.
  projects: [
    // ── Real work ──────────────────────────────────────────────────────────
    {
      slug: 'moranai',
      title: 'Moranai',
      category: 'Development',
      services: 'Design & Development',
      tech: [],                 // TODO: e.g. ['Next.js', 'TailwindCSS', 'Node.js']
      year: '2025',             // TODO: confirm
      location: 'Tanzania',
      color: '#e4e5e7',
      cover: 'images/work/moranai.svg',            // TODO: replace with a screenshot, e.g. 'images/work/moranai-1.jpg'
      placeholder: 'images/work/moranai.svg',
      images: [
        // TODO: drop your files into images/work/ (and videos/) and list them here, e.g.
        // { type: 'video', src: 'videos/moranai.mp4', poster: 'images/work/moranai-1.jpg' },
        // { src: 'images/work/moranai-2.jpg', alt: 'Home page' },
        // { src: 'images/work/moranai-3.jpg', alt: 'Services page' },
      ],
      description: 'Website for Moranai, live at moranai.co.tz. Screenshots, a video walkthrough and the full write-up are coming soon.',
      live: 'https://moranai.co.tz',
      github: '',
    },
    {
      slug: 'weare-moranai',
      title: 'We Are Moranai',
      category: 'Design',
      services: 'Design & Development',
      tech: [],                 // TODO
      year: '2025',             // TODO: confirm
      location: 'Tanzania',
      color: '#d5dbe0',
      cover: 'images/work/weare-moranai.svg',      // TODO: replace with a screenshot
      placeholder: 'images/work/weare-moranai.svg',
      images: [],               // TODO: screenshots / video as above
      description: 'Companion site for Moranai, live at weare.moranai.co.tz. Screenshots and a video walkthrough are coming soon.',
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
      placeholder: 'images/work/secureauth-portal.svg',
      images: [
        { src: U('1498050108023-c5249f4df085'), alt: 'Application code on a laptop', fallback: 'images/work/secureauth-portal-2.svg' },
        { src: U('1563986768609-322da13575f3', 1200), alt: 'Security lock illustration', fallback: 'images/work/secureauth-portal-3.svg' },
        { src: U('1517694712202-14dd9538aa97'), alt: 'Developer workstation', fallback: 'images/work/secureauth-portal.svg' },
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
      placeholder: 'images/work/threatmonitor.svg',
      images: [
        { src: U('1526374965328-7f61d4dc18c5'), alt: 'Streams of code on a dark screen', fallback: 'images/work/threatmonitor-2.svg' },
        { src: U('1460925895917-afdab827c52f', 1200), alt: 'Analytics charts on a laptop', fallback: 'images/work/threatmonitor-3.svg' },
        { src: U('1544197150-b99a580bb7a8'), alt: 'Server room', fallback: 'images/work/threatmonitor.svg' },
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
      placeholder: 'images/work/devsecops-pipeline.svg',
      images: [
        { src: U('1544197150-b99a580bb7a8'), alt: 'Data centre racks', fallback: 'images/work/devsecops-pipeline-2.svg' },
        { src: U('1555066931-4365d14bab8c', 1200), alt: 'Source code on a monitor', fallback: 'images/work/devsecops-pipeline-3.svg' },
        { src: U('1510915228340-29c85a43dcfe'), alt: 'Laptop with terminal and coffee', fallback: 'images/work/devsecops-pipeline.svg' },
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
      placeholder: 'images/work/pentest-framework.svg',
      images: [
        { src: U('1555066931-4365d14bab8c'), alt: 'Code on screen', fallback: 'images/work/pentest-framework-2.svg' },
        { src: U('1518770660439-4636190af475', 1200), alt: 'Circuit board close-up', fallback: 'images/work/pentest-framework-3.svg' },
        { src: U('1526374965328-7f61d4dc18c5'), alt: 'Code streams', fallback: 'images/work/pentest-framework.svg' },
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
      placeholder: 'images/work/campus-connect.svg',
      images: [
        { src: U('1523240795612-9a054b0db644'), alt: 'Students studying together', fallback: 'images/work/campus-connect-2.svg' },
        { src: U('1504384308090-c894fdcc538d', 1200), alt: 'Team working on laptops', fallback: 'images/work/campus-connect-3.svg' },
        { src: U('1498050108023-c5249f4df085'), alt: 'Building the app', fallback: 'images/work/campus-connect.svg' },
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
      placeholder: 'images/work/cryptovault.svg',
      images: [
        { src: U('1556742049-0cfed4f6a45d'), alt: 'Online payment with a card and laptop', fallback: 'images/work/cryptovault-2.svg' },
        { src: U('1518770660439-4636190af475', 1200), alt: 'Hardware close-up', fallback: 'images/work/cryptovault-3.svg' },
        { src: U('1551288049-bebda4e38f71'), alt: 'Portfolio dashboard', fallback: 'images/work/cryptovault.svg' },
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
