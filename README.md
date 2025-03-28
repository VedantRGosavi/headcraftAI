# headcraftAI

headcraftAI is a web application that allows users to upload multiple images of themselves and generates high-quality, real-life headshot pictures using AI technology. The app leverages OpenAI's GPT-4 and DALL-E models to analyze uploaded images and create professional-looking headshots.

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe
- **AI Services**: OpenAI API (GPT-4 and DALL-E)
- **Deployment**: Vercel
- **IDE**: Cursor

## Installation

Follow these steps to set up the project locally:


Set up environment variables
Create a .env.local file in the root directory with the following variables:
env

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

Obtain Supabase credentials from your Supabase project dashboard.

Get your OpenAI API key from the OpenAI platform.

Set up Stripe API keys from the Stripe dashboard.

Set up Supabase
Create a Supabase project and note down the URL and keys.

Enable the pgcrypto extension in Supabase for UUID generation:
sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

Run the following SQL in the Supabase SQL editor to create the required tables:
sql

CREATE TABLE images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE headshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL,
  prompt TEXT,
  generated_image_id UUID REFERENCES images(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

Create a storage bucket named user-images in Supabase with folders:
uploaded/ for user-uploaded images

generated/ for AI-generated headshots

Run the development server
bash

npm run dev

The app will be available at http://localhost:3000.

Usage
Sign up or log in using the authentication system.

Upload multiple images of yourself via the upload interface.

(Optional) Interact with the chat interface to specify headshot preferences.

Generate the headshot by initiating the AI processing.

View and download the generated headshot.

Project Structure

headcraftAI/
├── src/
│   ├── app/                    # App Router Directory
│   │   ├── (auth)/            # Auth Route Group
│   │   │   └── login/         # Login Route
│   │   │       └── page.tsx
│   │   ├── (dashboard)/       # Dashboard Route Group
│   │   │   └── page.tsx
│   │   ├── api/               # API Routes
│   │   │   ├── upload/        # Upload API Route
│   │   │   │   └── route.ts
│   │   │   ├── generate/      # Generation API Route
│   │   │   │   └── route.ts
│   │   │   └── stripe/        # Stripe API Routes
│   │   │       └── route.ts
│   │   ├── _components/       # App-specific Components
│   │   ├── layout.tsx         # Root Layout
│   │   └── page.tsx           # Home Page
│   │
│   ├── components/            # Shared Components
│   │   ├── forms/            # Form Components
│   │   │   ├── UploadForm.tsx
│   │   │   └── LoginForm.tsx
│   │   ├── ui/               # UI Components (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   └── shared/           # Shared Components
│   │       ├── HeadshotDisplay.tsx
│   │       └── ChatInterface.tsx
│   │
│   ├── lib/                  # Utility Functions
│   │   ├── supabase.ts       # Supabase Client
│   │   ├── openai.ts         # OpenAI Client
│   │   ├── stripe.ts         # Stripe Client
│   │   └── utils.ts          # Utility Functions
│   │
│   ├── types/               # TypeScript Types
│   │   ├── user.ts
│   │   └── image.ts
│   │
│   ├── hooks/              # Custom React Hooks
│   │   ├── useAuth.ts
│   │   └── useUpload.ts
│   │
│   └── styles/             # Styles
│       └── globals.css     # Global Styles
│
├── public/                 # Public Assets
│   └── images/            # Static Images
│
├── .env.local             # Environment Variables
├── next.config.js         # Next.js Config
├── tailwind.config.js     # Tailwind Config
├── tsconfig.json          # TypeScript Config
├── package.json           # Dependencies
└── README.md              # Documentation

Development
IDE: Any code editor works, but Cursor is recommended for its AI-powered features to accelerate development.

Deployment
To deploy the app to Vercel:
Push the repository to GitHub.

Import the project into Vercel.

Add the environment variables listed above in the Vercel dashboard.

Deploy the app—Vercel will handle the build and deployment automatically.

Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your changes.
License
This project is licensed under the MIT License.

