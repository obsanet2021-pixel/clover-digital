# 🍀 CLOVER DIGITAL

> **Reach Your Peak Performance** — A premium digital agency website built with pure HTML, CSS, and JavaScript.

[![Live Site](https://img.shields.io/badge/Live%20Site-obsan2021.github.io%2Fclover--digital-22c55e?style=flat-square&logo=github)](https://obsan2021.github.io/clover-digital/)
[![HTML](https://img.shields.io/badge/HTML-78.6%25-e34f26?style=flat-square&logo=html5&logoColor=white)](.)
[![CSS](https://img.shields.io/badge/CSS-18.2%25-1572b6?style=flat-square&logo=css3&logoColor=white)](.)
[![JavaScript](https://img.shields.io/badge/JavaScript-3.2%25-f7df1e?style=flat-square&logo=javascript&logoColor=black)](.)

---

## 📌 Overview

**CLOVER DIGITAL** is a full digital agency website for a creative studio based in Adama, Ethiopia. It showcases services, portfolio work, pricing plans, and company information — all served as a static GitHub Pages site with no build tools or frameworks required.

---

## 🗂️ Project Structure

```
clover-digital/
├── index.html          # Home — hero, services, portfolio, process, testimonials
├── about.html          # About — team, story, values
├── services.html       # Services — web dev, UI/UX design, marketing, graphic design
├── portfolio.html      # Portfolio — filterable project showcase
├── pricing.html        # Pricing — service packages and plans
├── blog.html           # Insights / blog articles
├── contact.html        # Contact — form and location info
├── invoice.html        # 🆕 Invoice Generator — PDF invoice tool for clients
├── 404.html            # Custom 404 error page
├── privacy.html        # Privacy Policy
├── terms.html          # Terms of Service
├── robots.txt          # Search engine crawl rules
├── sitemap.xml         # XML sitemap for SEO
├── .htaccess           # Apache server config (redirects, caching)
│
├── assets/
│   ├── css/
│   │   ├── main.css        # Core styles, design tokens, components
│   │   ├── responsive.css  # Mobile-first responsive breakpoints
│   │   └── animations.css  # CSS keyframe animations and transitions
│   ├── js/
│   │   ├── main.js         # Navigation, mobile menu, scroll behavior
│   │   ├── animations.js   # Intersection observer animations
│   │   └── portfolio.js    # Portfolio filter and dynamic loading
│   └── images/
│       ├── logo/           # Brand logos (clover p1.png)
│       └── about/          # Team and about section photos
│
├── data/               # JSON data files (services, portfolio, testimonials)
├── includes/           # Reusable HTML partials
└── .vscode/            # Editor settings
```

---

## 🌐 Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero section, stats, services overview, portfolio highlights, process, testimonials, CTA |
| About | `/about.html` | Agency story, team, values, 10+ years of experience |
| Services | `/services.html` | Web Development, UI/UX Design, Digital Marketing, Graphic Design |
| Portfolio | `/portfolio.html` | Filterable project gallery (All / Web / Design / Marketing) |
| Pricing | `/pricing.html` | Service packages and pricing tiers |
| Insights | `/blog.html` | Articles and industry insights |
| Contact | `/contact.html` | Contact form, address (Adama, Ethiopia), phone, email |
| **Invoice** | `/invoice.html` | 🆕 Internal invoice generator — create & download PDF invoices (ETB) |

---

## ✨ Features

- **Fully static** — no server, no database, no build step; works straight from GitHub Pages
- **Responsive design** — mobile-first layout with dedicated `responsive.css`
- **Smooth animations** — CSS keyframes + Intersection Observer scroll reveals
- **Dynamic portfolio** — JavaScript-powered filter by project category
- **Counter animations** — animated stat numbers (500+ projects, 200+ clients, 15 awards)
- **SEO ready** — meta tags, `robots.txt`, `sitemap.xml`, structured descriptions
- **Invoice Generator** — internal tool to create branded PDF invoices in ETB with one click
- **Custom 404** — branded error page
- **Font Awesome 6** icons throughout
- **Plus Jakarta Sans** typography (Google Fonts)

---

## 🧾 Invoice Generator

A built-in internal tool at `/invoice.html` that lets the team generate professional, branded PDF invoices for clients without any external software.

**What it does:**
- Fill in company info, client details, invoice number, and dates
- Add unlimited line items with automatic subtotal, tax, and total calculation
- Live preview updates in real time as you type
- One-click PDF download (A4, print-ready)
- Print directly from the browser
- Pre-configured for **Ethiopian Birr (ETB)** and 15% VAT

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (semantic) |
| Styling | Vanilla CSS3 (custom properties, grid, flexbox) |
| Scripting | Vanilla JavaScript (ES6+) |
| Icons | Font Awesome 6.4 |
| Fonts | Google Fonts — Plus Jakarta Sans, DM Sans, Playfair Display |
| PDF Export | jsPDF 2.5 + html2canvas 1.4 |
| Hosting | GitHub Pages |

---

## 🚀 Getting Started

No build tools needed. Just clone and open.

```bash
git clone https://github.com/obsan2021/clover-digital.git
cd clover-digital
```

Then open `index.html` in your browser — or use a local server for best results:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Visit `http://localhost:8080`

---

## 📦 Deployment

This site is deployed automatically via **GitHub Pages** from the `main` branch root.

To deploy your own fork:
1. Go to **Settings → Pages**
2. Source: `Deploy from a branch` → `main` → `/ (root)`
3. Save — your site will be live at `https://<your-username>.github.io/clover-digital/`

---

## 📁 Adding the Invoice Page to Navigation

The invoice page is an internal tool. To link it from the site nav, add this line to the `<ul class="nav-menu">` in any HTML file:

```html
<li><a href="invoice.html">Invoice</a></li>
```

---

## 📞 Contact

**CLOVER DIGITAL**
- 📍 Adama, Ethiopia
- 📞 +251 998 065 377
- ✉️ hello@cloverdigital.com
- 🕐 Mon–Fri: 9:00 AM – 6:00 PM

---


## 📄 License

© 2026 CLOVER DIGITAL. All rights reserved.

---

<div align="center">
  <sub>Built with 💚 by the Clover Digital team · Adama, Ethiopia</sub>
</div>
