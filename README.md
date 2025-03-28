# headcraftAI

headcraftAI is a web application that allows users to upload multiple images of themselves and generates high-quality, real-life headshot pictures using AI technology. The app leverages OpenAI's GPT-4 and DALL-E models to analyze uploaded images and create professional-looking headshots.

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Backend**: Next.js API Routes
- **Database**: Neon (PostgreSQL serverless)
- **Authentication**: Stack Auth
- **Payment Processing**: Stripe
- **AI Services**: OpenAI API (GPT-4 and DALL-E)
- **Deployment**: Vercel
- **IDE**: Cursor

## Installation

Follow these steps to set up the project locally:

### Set up environment variables
Create a .env.local file in the root directory with the following variables:
```env
# Database
NEON_DATABASE_URL=your_neon_database_url

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_client_key
STACK_SECRET_SERVER_KEY=your_stack_secret_server_key

# Other Services
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

1. Get your Neon database URL from your Neon project dashboard
2. Create a Stack Auth project at https://app.stack-auth.com and get your API keys
3. Get your OpenAI API key from the OpenAI platform
4. Set up Stripe API keys from the Stripe dashboard

### Set up Database
Create a Neon project and note down the connection URL.

The following tables will be automatically created in your database:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE generated_headshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id UUID REFERENCES uploads(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    style TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);
```

### Run the development server
```bash
npm run dev
```

The app will be available at http://localhost:3000.

## Usage
1. Sign up or log in using Stack Auth
2. Upload multiple images of yourself via the upload interface
3. (Optional) Interact with the chat interface to specify headshot preferences
4. Generate the headshot by initiating the AI processing
5. View and download the generated headshot

## Project Structure

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
│   │   │   ├── create-checkout-session/ # Stripe Checkout Session
│   │   │   │   └── route.ts
│   │   │   └── storage/       # Storage API Routes
│   │   │       └── upload/
│   │   │           └── route.ts
│   │   ├── pricing/          # Pricing Page
│   │   │   └── page.tsx
│   │   ├── success/          # Payment Success Page
│   │   │   └── page.tsx
│   │   ├── handler/          # Stack Auth Handlers
│   │   │   └── [...stack]/
│   │   │       └── page.tsx
│   │   ├── layout.tsx         # Root Layout
│   │   ├── loading.tsx        # Loading Component
│   │   └── page.tsx           # Home Page
│   │
│   ├── components/            # Shared Components
│   │   ├── PricingPage.tsx    # Pricing Component
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
│   │   ├── db.ts            # Database Client (Neon)
│   │   ├── neondb.ts        # Neon DB Client
│   │   ├── openai.ts        # OpenAI Client
│   │   ├── images.ts        # Image Processing
│   │   ├── stripe.ts        # Stripe Client
│   │   ├── auth.ts          # Authentication Logic
│   │   └── utils.ts         # Utility Functions
│   │
│   ├── types/               # TypeScript Types
│   │   ├── user.ts
│   │   └── image.ts
│   │
│   ├── hooks/              # Custom React Hooks
│   │   ├── useAuth.ts
│   │   └── useUpload.ts
│   │
│   ├── stack.tsx           # Stack Auth Configuration
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
└── README.md             # Documentation

## Development
IDE: Any code editor works, but Cursor is recommended for its AI-powered features to accelerate development.

## Deployment
To deploy the app to Vercel:
1. Push the repository to GitHub
2. Import the project into Vercel
3. Add the environment variables listed above in the Vercel dashboard
4. Deploy the app—Vercel will handle the build and deployment automatically

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License
This project is licensed under the MIT License.

