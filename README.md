# Binx & Co PR Ltd - Website Documentation

## Overview
This is a modern, responsive website for Binx & Co PR Ltd, a London-based communications hub providing PR, marketing, and brand consultancy services to chefs, restaurants, pubs, and lifestyle brands across the UK.

## Project Structure

```
newsite/
├── index.html          # Main HTML file
├── style.css           # Stylesheet with all design tokens and component styles
├── js/                 # JavaScript modules
│   ├── main.js         # Main entry point
│   ├── utils/          # Utility modules
│   │   ├── imageLoader.js    # Image lazy loading
│   │   ├── animations.js     # Scroll-triggered animations
│   │   └── scrollEffects.js  # Parallax and scroll effects
│   ├── components/      # UI components
│   │   ├── navigation.js    # Mobile menu and smooth scroll
│   │   ├── clientItems.js   # Client item expansion/collapse
│   │   └── marquee.js       # Marquee scrolling functionality
│   └── services/       # Data services
│       ├── clientService.js  # Client data loading
│       └── clientRenderer.js  # Client rendering logic
├── assets/             # Images and media files
│   ├── Binxandco.png   # Company logo
│   ├── opheem2020summer4991.jpg  # Hero background image
│   ├── opheem12111.jpg # Footer background image
│   └── [client images] # Various client/brand images (600x403px)
├── clients.json        # Client data (brands, restaurants, talent)
├── sw.js              # Service worker for PWA
└── README.md          # This file
```

## Technology Stack

- **HTML5**: Semantic markup for structure
- **CSS3**: Custom properties (CSS variables), Flexbox, animations
- **Vanilla JavaScript**: No frameworks, lightweight and fast
- **Google Fonts**: Inter (body text) and Lato (headings)

## Design System

### Color Palette
Defined in `:root` CSS variables:
- `--primary-color: #344602` - Dark olive green (brand color)
- `--secondary-color: #e8d2d0` - Soft pink (accent/background)
- `--text-color: #333333` - Dark gray (main text)
- `--bg-color: #ffffff` - White (page background)
- `--header-bg: rgba(255, 255, 255, 0.95)` - Semi-transparent white

### Typography
- **Body Font**: Inter (300, 400, 600 weights)
- **Heading Font**: Lato (300, 400 weights)
- Font weights are kept light (300) for an elegant, modern feel

### Transitions
- Global transition speed: `0.3s` (defined as `--transition-speed`)

## Page Sections

### 1. Header (Fixed Navigation)
- **Location**: Top of page, fixed position
- **Features**:
  - Company logo (left)
  - Navigation menu (right): Home, About, Clients, Contact
  - Mobile hamburger menu for responsive design
  - Backdrop blur effect for modern aesthetic
  - Smooth scroll to sections on click

### 2. Hero Section
- **ID**: `#home`
- **Features**:
  - Full-width background image with opacity overlay
  - Centered company logo
  - 60vh height for impactful first impression
  - Fade-in animation on load

### 3. About Section
- **ID**: `#about`
- **Content**: Company description and founder information
- **Layout**: Centered text, max-width 800px for readability
- **Background**: White

### 4. Clients Section ("Who We Work With")
- **ID**: `#clients`
- **Features**:
  - Two categories: "Brands & Restaurants" and "Talent"
  - Infinite horizontal scrolling marquee animation
  - Reverse scroll direction for second category
  - Pause on hover for better UX
  - Client cards with hover effects
  - Each card shows:
    - Client image (600x403px)
    - Client name
    - "Visit Website/Instagram" link on hover
- **Background**: Light gray (#f9f9f9)

#### Marquee Animation
- **Animation**: `scroll` keyframe (160s duration, linear)
- **Direction**: Normal for first row, reverse for second
- **Behavior**: Pauses when user hovers over container
- **Implementation**: Content is duplicated 4x in JavaScript for seamless infinite scroll

### 5. Contact Section ("Work With Us")
- **ID**: `#contact`
- **Content**: Email link (charlotte@binxandco.co.uk)
- **Background**: Secondary color (soft pink)
- **Features**: Large, clickable email with underline hover effect

### 6. Footer
- **Features**:
  - Background image with color overlay
  - Instagram social link (circular icon)
  - Copyright notice
  - Hidden logo (for SEO purposes)

## JavaScript Functionality

The JavaScript is organised into ES6 modules for better maintainability:

### Module Structure
- **`js/main.js`**: Main entry point that initialises all components
- **Utils**: Image loading, animations, and scroll effects
- **Components**: Navigation, client items, and marquee functionality
- **Services**: Client data loading and rendering

### Key Features

#### Mobile Menu Toggle
- Hamburger icon transforms to X when menu is open
- Smooth slide-down animation for mobile navigation
- Auto-closes when navigation link is clicked

#### Smooth Scrolling
- All anchor links (`#home`, `#about`, etc.) scroll smoothly
- 80px offset to account for fixed header
- Works on both desktop and mobile

#### Marquee Scrolling
- Client content is duplicated 4 times on page load
- Ensures seamless infinite scrolling without gaps
- Drag-to-scroll functionality with momentum
- Pause on hover for better UX
- Applied to all `.marquee-content` elements

#### Client Item Expansion
- Click client cards to expand into modal view
- Shows full image and description
- Escape key or click outside to close

## Responsive Design

### Breakpoint: 768px (Mobile/Tablet)
- Navigation switches to hamburger menu
- Mobile menu slides down from header
- Font sizes reduce for better mobile readability
- Maintains all functionality and animations

## Client Card Interaction

### Default State
- White background with subtle shadow
- 250px width, 20px padding
- Client image (180px height, cover fit)
- Client name below image

### Hover State
- Scale up to 105% (transform)
- Increased shadow for depth
- Image opacity reduces to 30%
- Name fades out
- Details overlay appears with:
  - Client name (h4)
  - "Visit Website/Instagram" button
  - Primary color button with hover effect

## Image Requirements

### Client Images
- **Dimensions**: 600x403px (3:2 aspect ratio)
- **Format**: JPG, JPEG, or PNG
- **Location**: `assets/` folder
- **Naming**: Descriptive, lowercase with hyphens

### Logo
- **File**: `Binxandco.png`
- **Usage**: Header, hero, footer
- **Format**: PNG with transparency

### Background Images
- **Hero**: `opheem2020summer4991.jpg`
- **Footer**: `opheem12111.jpg`
- **Format**: High-resolution JPG

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- CSS Custom Properties support required
- Smooth scrolling behavior supported

## Performance Optimizations

- Minimal JavaScript (no frameworks)
- CSS animations use `transform` and `opacity` (GPU-accelerated)
- Images are appropriately sized (600x403px)
- Font preconnect for faster Google Fonts loading
- Backdrop filter for modern blur effects

## Accessibility Features

- Semantic HTML5 elements
- ARIA labels on interactive elements (mobile menu toggle)
- Sufficient color contrast ratios
- Keyboard navigation support
- `rel="noopener"` on external links for security

## Future Enhancements

Potential improvements for future iterations:
- Add lazy loading for images
- Implement service worker for offline support
- Add more detailed case studies for each client
- Include testimonials section
- Add blog/news section
- Implement contact form with backend integration
- Add Google Analytics or privacy-friendly analytics

## Maintenance

### Adding New Clients
1. Add client image to `assets/` folder (600x403px)
2. Add new `<a class="client-item">` block in appropriate category
3. Include image, name, and link
4. Marquee will automatically include new items

### Updating Colors
- Modify CSS variables in `:root` selector in `style.css`
- Changes will propagate throughout the site

### Updating Content
- About section: Edit text in `#about` section
- Contact email: Update in `#contact` section
- Social links: Update href in footer

## Credits

- **Design & Development**: Modern, clean aesthetic with smooth animations
- **Fonts**: Google Fonts (Inter, Lato)
- **Icons**: Inline SVG (Instagram icon)

## License

© 2025 Binx & Co PR Ltd. All rights reserved.
