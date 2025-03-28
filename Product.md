
---

### PRODUCT.md

```markdown
# headcraftAI Product Specification

## Vision

headcraftAI aims to provide an accessible platform for individuals to generate professional-quality headshots without a photographer. Using advanced AI models from OpenAI (GPT-4 and DALL-E), the app creates realistic headshots based on user-uploaded images, democratizing access to high-quality imagery.

## Target Audience

- Professionals needing headshots for LinkedIn, resumes, or personal branding.
- Students and job seekers looking for affordable profile pictures.
- Anyone seeking a high-quality headshot without professional photography services.

## Key Features

- User authentication and account management.
- Upload functionality for multiple images.
- Optional chat interface to refine headshot preferences.
- AI-powered headshot generation using OpenAI's GPT-4 and DALL-E.
- Secure storage and retrieval of images via Supabase.
- Payment processing for headshot generation via Stripe.
- Downloadable headshot images.

## User Stories

1. As a user, I want to create an account and log in securely.
2. As a user, I want to upload multiple images of myself to the app.
3. As a user, I want to optionally specify preferences for my headshot through a chat interface.
4. As a user, I want to initiate the headshot generation process.
5. As a user, I want to view and download my generated headshot.
6. As a user, I want to manage my account and view my past headshots.

## Design Considerations

- **Simple UI**: Intuitive and easy-to-navigate interface.
- **Responsive**: Optimized for both mobile and desktop devices.
- **Feedback**: Clear indicators during image upload and processing.
- **Security**: Safe handling of user data and images.

## Technical Requirements

- Built with **Next.js** and **TypeScript**.
- Uses **Supabase** for database, storage, and authentication.
- Integrates **OpenAI API** (GPT-4 for analysis, DALL-E for generation).
- Implements **Stripe** for payment processing.
- Deployed on **Vercel**.

## AI Workflow

1. **Image Upload**: User uploads multiple images to `user-images/uploaded/`.
2. **Optional Chat Interaction**: User chats with ChatGPT to specify preferences (e.g., background color, attire).
3. **Prompt Generation**:
   - GPT-4 analyzes uploaded images to create a base description (e.g., "A person with short black hair").
   - Chat history (if any) refines the description (e.g., "A professional headshot with a blue background").
4. **Image Generation**: The final prompt is sent to DALL-E to generate the headshot.
5. **Storage**: The generated image is saved to `user-images/generated/` and linked to the user’s account.

## Roadmap

1. **Set up project structure and dependencies.**
2. **Implement user authentication with Supabase Auth.**
3. **Create image upload functionality using Supabase Storage.**
4. **Integrate OpenAI API for headshot generation.**
5. **Set up Stripe for payment processing.**
6. **Develop frontend UI components.**
7. **Test the end-to-end workflow.**
8. **Deploy to Vercel.**