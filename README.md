# EGAY ART - Full-Stack Web Application

A modern, professional art gallery website built with Next.js, Tailwind CSS, MySQL, and Cloudinary. Perfect for artists to showcase and manage their work with style and elegance.

## Features

### Public Website
- **Home Page**: Hero section with featured artworks
- **Gallery**: Responsive grid display with filtering and search
- **Artwork Details**: Full artwork information with inquiry form
- **About**: Artist biography and information
- **Contact**: General inquiry form

### Admin Dashboard
- **Artwork Management**: Add, edit, and delete artworks
- **Image Upload**: Direct Cloudinary integration
- **Status Management**: Mark artworks as Available, Sold, or Reserved
- **Inquiry Management**: View and manage all inquiries

### Technical Stack
- Next.js 15+ (App Router)
- React 18
- Tailwind CSS
- MySQL 8.0+
- Cloudinary (Image hosting)
- Vercel (Deployment)

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- MySQL database (PlanetScale or self-hosted)
- Cloudinary account (free tier available)
- Vercel account (for deployment)

### 2. Local Development Setup

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Set Up Database
1. Create a MySQL database (PlanetScale or local)
2. Run the SQL schema:
```bash
# Using mysql CLI
mysql -u username -p database_name < DATABASE_SCHEMA.sql
```

Or use your database management tool to execute `DATABASE_SCHEMA.sql`

#### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your variables:

**MySQL Configuration:**
```
MYSQL_HOST=your_planetscale_host.us-east-2.psdb.cloud
MYSQL_PORT=3306
MYSQL_USER=username
MYSQL_PASSWORD=password
MYSQL_DATABASE=database_name
```

**Get PlanetScale Connection String:**
- Go to https://app.planetscale.com
- Create a new database
- Click "Connect" and select "Node.js"
- Copy the connection details

**Cloudinary Configuration:**
1. Go to https://cloudinary.com
2. Sign up for free account
3. In Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Admin Password:**
```
ADMIN_PASSWORD=your_secure_password
```

**Site URL:**
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Step 4: Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser

**Admin Login:**
- Password: whatever you set as `ADMIN_PASSWORD` in `.env.local`
- Sign in at: `http://localhost:3000/admin/login`
- The admin area is intentionally not linked from the public site.

### 3. Project Structure

```
egay-art-gallery/
├── app/
│   ├── layout.js              # Root layout
│   ├── page.js                # Home page
│   ├── globals.css            # Global styles
│   ├── gallery/
│   │   ├── page.js            # Gallery listing
│   │   └── [id]/
│   │       └── page.js        # Artwork details
│   ├── about/
│   │   └── page.js            # About page
│   ├── contact/
│   │   └── page.js            # Contact page
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.js        # Admin dashboard
│   └── api/
│       ├── artworks/
│       │   ├── route.js       # GET/POST artworks
│       │   └── [id]/
│       │       └── route.js   # GET/PUT/DELETE artwork
│       ├── inquiries/
│       │   └── route.js       # GET/POST inquiries
│       └── upload/
│           └── route.js       # Image upload
├── components/
│   ├── Navbar.js              # Navigation
│   ├── Footer.js              # Footer
│   └── AdminPanel.js          # Admin interface
├── lib/
│   ├── db.js                  # Database connection
│   └── cloudinary.js          # Cloudinary utilities
├── public/                    # Static files
├── .env.example              # Environment template
├── DATABASE_SCHEMA.sql       # Database schema
├── next.config.js            # Next.js config
├── tailwind.config.js        # Tailwind config
├── postcss.config.js         # PostCSS config
├── jsconfig.json             # JS config
└── package.json              # Dependencies

```

## Deployment on Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your_repo_url
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Click "Import"

### Step 3: Configure Environment Variables
1. In Project Settings → Environment Variables
2. Add all variables from `.env.local`:
   - MYSQL_HOST
   - MYSQL_PORT
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_DATABASE
   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - ADMIN_PASSWORD
   - NEXT_PUBLIC_SITE_URL (use your Vercel URL)

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your site is live!

**Update NEXT_PUBLIC_SITE_URL after getting your Vercel domain:**
- In Project Settings → Environment Variables
- Update `NEXT_PUBLIC_SITE_URL` to your Vercel domain
- Redeploy

## API Documentation

### Artworks

**Get All Artworks**
```
GET /api/artworks
GET /api/artworks?limit=3
```

**Get Single Artwork**
```
GET /api/artworks/[id]
```

**Create Artwork**
```
POST /api/artworks
Body: {
  title: string,
  image_url: string,
  category: string,
  medium: string,
  dimensions: string,
  year_created: number,
  price: number,
  status: 'Available' | 'Sold' | 'Reserved',
  description: string
}
```

**Update Artwork**
```
PUT /api/artworks/[id]
Body: { same as create }
```

**Delete Artwork**
```
DELETE /api/artworks/[id]
```

### Inquiries

**Get All Inquiries**
```
GET /api/inquiries
```

**Create Inquiry**
```
POST /api/inquiries
Body: {
  name: string,
  email: string,
  message: string,
  artwork_id: number (optional)
}
```

### Upload

**Upload Image**
```
POST /api/upload
Body: FormData with 'file' field
Response: { url: string }
```

## Customization

### Update Artist Information
- Edit [app/about/page.js](app/about/page.js)
- Update contact info in [app/contact/page.js](app/contact/page.js)
- Edit footer in [components/Footer.js](components/Footer.js)

### Styling
- Tailwind CSS configuration: [tailwind.config.js](tailwind.config.js)
- Global styles: [app/globals.css](app/globals.css)
- Customize colors, fonts, and responsive breakpoints as needed

### Admin Authentication
For production, replace the simple password auth in [app/admin/dashboard/page.js](app/admin/dashboard/page.js) with:
- JWT tokens
- OAuth (GitHub, Google)
- Next-Auth.js
- Custom authentication service

## Troubleshooting

### Database Connection Errors
- Verify credentials in `.env.local`
- Check if IP is whitelisted (PlanetScale: Settings → Allowed IPs)
- Ensure database is created

### Image Upload Fails
- Verify Cloudinary credentials
- Check file size limits
- Ensure API keys have upload permissions

### Admin Login Not Working
- Check `ADMIN_PASSWORD` is set in `.env.local` (no trailing spaces)
- Check `AUTH_SECRET` is set — without it the login route returns 500
- Never commit a real password to this file or to the repo

### Vercel Deployment Issues
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure database is accessible from Vercel IPs
- Check Node.js version compatibility

## Performance Tips

1. **Image Optimization**: Cloudinary automatically optimizes images
2. **Caching**: Configure Next.js caching in `next.config.js`
3. **Database Indexes**: Already included in schema for common queries
4. **CDN**: Vercel automatically uses Edge Network

## Security Notes

1. **Admin Password**: Change default password before production
2. **Environment Variables**: Never commit `.env.local` (included in `.gitignore`)
3. **CORS**: Configure CORS if using external APIs
4. **SQL Injection**: Using parameterized queries with mysql2
5. **Rate Limiting**: Consider adding rate limiting for production

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Vercel Documentation](https://vercel.com/docs)

## License

This project is open source and available under the MIT License.

## Contact

For questions or support, contact: support@egayart.com

---

**Happy Creating! 🎨**
