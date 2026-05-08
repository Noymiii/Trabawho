# TRABAWHO - Project Documentation

## 1. Project Overview
**TRABAWHO** is a web-based service marketplace application that connects customers needing specific services with skilled workers looking for jobs. The platform utilizes a swipe-and-match interaction model inspired by modern dating applications (like Tinder), making job discovery interactive, fast, and user-friendly.

## 2. Technology Stack
- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite (v8.0.11)
- **Styling:** Tailwind CSS v4 
- **Icons:** `lucide-react` (High-quality SVG icons)
- **Animations:** `framer-motion`
- **Routing:** `react-router-dom`
- **Backend/API:** Node.js / Express (Integrated via Axios in frontend)
- **Infrastructure:** Docker & Kubernetes (Deployment configurations included in `/k8s` directory)

## 3. UI/UX Design Evolution (The "Datify" Overhaul)
The frontend recently underwent a massive architectural and visual overhaul to transition from a generic "Dark Cyber" glassmorphism template into a premium, custom **"Datify" Light Mode** mobile-first application.

### Key Visual Changes
1. **Light Mode Transition:**
   - The entire application was inverted from dark mode to a clean, crisp Light Mode aesthetic.
   - Backgrounds utilize a subtle `#FAFAFA` off-white to reduce eye strain, while active cards use pure `#FFFFFF`.
   - Text colors were adjusted to dark grays (`#111827`) for high legibility.

2. **The "Datify" Purple Palette:**
   - Replaced old warm/coral colors with a vibrant, punchy Datify Purple (`#9333EA`).
   - Implemented a `bg-primary-gradient` utility class to ensure primary elements pop visually.

3. **Solid Shapes over Glassmorphism:**
   - Stripped out all `.glass` utility classes (heavy blurs and semi-transparent borders).
   - Replaced with a new `.card` utility class that relies on solid backgrounds, crisp borders, and soft native-mobile drop shadows (`shadow-card`).
   - Removed blurry background gradient "meshes" and "orbs" to maintain a clean, distraction-free environment.

4. **Component Refinements:**
   - **Buttons:** Converted from standard rounded rectangles to fully rounded pill shapes (`rounded-full`) to match the playful, swipe-app aesthetic.
   - **Inputs:** Thickened borders and removed transparent backgrounds in favor of solid, elevated input fields.
   - **Icons:** Strict enforcement of clean SVG icons (`lucide-react`). All decorative icons that resembled "emojis" (e.g., Sparkles, Lightning Bolts) were stripped from core call-to-actions to maintain professionalism.

## 4. Major File Updates
- **`src/index.css`**: Centralized the Tailwind `@theme` variables to establish the Light Mode palette and custom scrollbar utilities.
- **`src/components/ui/Button.tsx`**: Updated variants to support pill-shapes and solid shadows.
- **`src/components/ui/Input.tsx`**: Updated border radiuses to `rounded-xl`.
- **`src/components/layout/Navbar.tsx`**: Removed glass headers for a solid white top bar.
- **`src/pages/Landing.tsx`**: Completely redesigned hero sections and feature grids to use solid `.card` containers.
- **`src/pages/Login.tsx` & `src/pages/Register.tsx`**: Removed background blurs and updated form containers to pure white elevated cards.
- **`src/pages/Dashboard.tsx`**: **Complete Layout Redesign.** Scrapped the standard 3-column data dashboard. Built a centralized, mobile-first profile layout featuring a large avatar header, a massive purple gradient "Start Swiping" CTA, a horizontally scrolling match queue, and chunky 2x2 grid action buttons.

## 5. Next Steps / Future Roadmap
1. **Match Engine Logic:** Finalize the geolocation and skill-matching algorithm in the backend.
2. **Image Uploading:** Integrate S3 or Cloudinary for user profile avatars and job images.
3. **Real-time Chat:** Ensure WebSocket integration for instant messaging between matched users.
4. **Kubernetes Deployment:** Finalize Ingress controllers and deploy to the cloud via the configured `/k8s` manifests.
