# Gentale ✨

Welcome to Gentale, a whimsical storytelling app where you co-create adventures!

## 🚀 Project Overview

Gentale uses generative AI to craft unique, interactive stories based on user prompts and choices. It aims to provide a playful and comforting experience, reminiscent of bedtime storybooks but with a modern, AI-powered twist.

## 🛠️ Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Database & Auth:** [Supabase](https://supabase.io/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
*   **AI Models:** [Google Generative AI](https://ai.google.dev/), [OpenAI](https://openai.com/)
*   **Language:** TypeScript

##📋 Prerequisites

*   Node.js (v20 or later recommended)
*   npm, yarn, pnpm, or bun
*   A Supabase account (for database and authentication)
*   API keys for Google Generative AI and OpenAI

## ⚙️ Environment Variables

To run the project locally, you need to set up your environment variables.

1.  Create a file named `.env.local` in the root of the project.
2.  Add the following environment variables, replacing the placeholder values with your actual credentials:

    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY # If needed for server-side operations

    # AI Providers
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
    OPENAI_API_KEY=YOUR_OPENAI_API_KEY

    # Optional: Add any other necessary environment variables
    ```

    You can find your Supabase URL and Anon Key in your Supabase project settings (Project Settings > API). The Service Role Key should be kept secret and is typically used for server-side operations that bypass Row Level Security.

## ▶️ Running Locally

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd gentale
    ```

2.  **Install dependencies:**
    Choose your preferred package manager:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Set up environment variables:**
    Follow the instructions in the [Environment Variables](#⚙️-environment-variables) section above.

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🎨 Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for utility-first styling and [Shadcn UI](https://ui.shadcn.com/) for reusable UI components. Custom styles and theme configurations can be found in `tailwind.config.ts` and `src/app/globals.css`. Components are located in `src/components/ui`.

The visual style aims for a playful, whimsical, and comforting feel:
*   **Primary Colors:** BrightPink (`#F45B69`), Almond (`#F1DAC4`), Black (`#000000`).
*   **Shapes:** Rounded corners (`16px`), pill-shaped buttons.
*   **Spacing:** Generous padding and line height for readability.

## 💾 Database

Supabase handles the PostgreSQL database and authentication. The database schema involves tables like `stories`, `scenes`, and `memories`.

You might need to set up database tables and potentially run migrations. Refer to the Supabase documentation for managing your database schema. The TypeScript types corresponding to the database schema can be found in `src/types/db.ts`.

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Ensure you configure the necessary environment variables in your Vercel project settings.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
