# Insilicology

Insilicology is an online learning platform offering top skills in web development, SEO, AI, and digital marketing. It provides live and recorded courses, interactive exams, certificates, and seamless payment integration (including bKash). The platform is designed to help learners and professionals upskill efficiently with industry-relevant content and tools.

## 🚀 Features
- Live and recorded courses
- Interactive exams and results
- Certificates of completion
- Course resources and class recordings
- User dashboard with progress tracking
- Secure payments (bKash integration)
- Blog and knowledge base
- Contact and support system
- Campus ambassador program

## 🛠️ Tech Stack
- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/) (Database & Auth)
- [Sanity](https://www.sanity.io/) (CMS)
- [bKash](https://www.bkash.com/) (Payment Gateway)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 📦 Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/________/insilicology-2.git
   cd insilicology-2
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Environment variables:**
   - Copy `.env.example` to `.env.local` and fill in the required values (Supabase, Sanity, bKash, etc).

4. **Sanity type generation (optional, for schema updates):**
   ```bash
   npm run typegen
   ```

## 🏃 Running the Project

Start the development server:
```bash
npm run dev
# or
yarn dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

## 📄 Documentation
- **bKash Payment Integration:**
  - [Performance Optimization Guide](docs/BKASH_PERFORMANCE_OPTIMIZATION.md)
  - [Troubleshooting Guide](docs/BKASH_TROUBLESHOOTING.md)
- For more, see the `docs/` folder.

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📜 License
[MIT](LICENSE) (or specify your license here)
