
# ChirpStream: A Modern Social Media & Music Platform

ChirpStream is a feature-rich, full-stack social media application that merges the real-time social interaction of platforms like Twitter with the music discovery and streaming capabilities of Spotify. Built with a modern, robust tech stack, this project serves as a comprehensive demonstration of full-stack development skills.

![ChirpStream Mockup](https://picsum.photos/1200/600?grayscale)
_You can replace this with a screenshot of your app._

---

## Key Features

### Social Networking
- **Authentication & Multi-Account Management:** Secure user sign-up and login with Firebase Authentication. Users can add and seamlessly switch between multiple accounts.
- **Dynamic "For You" Feed:** A personalized home feed that displays posts from followed users, creating a curated content experience.
- **Interactive Posts:** Create posts with text, up to four images, and tags. Users can like, repost, bookmark, and reply to other posts.
- **Detailed Post Threads:** View a single post and its entire thread of replies in a dedicated, conversation-focused view.
- **Comprehensive User Profiles:** Profiles display user bios, stats (post count, followers, following), and a timeline of their posts.
- **Real-Time Messaging:** A built-in direct messaging system allows for private, one-on-one conversations with real-time message updates.
- **Notifications:** Users receive real-time notifications for likes, replies, and new followers.
- **Explore & Search:** An "Explore" page to discover trending topics and a global search to find users or posts by keywords and tags.

### Premium Features & Monetization
- **Tiered Subscriptions (`Premium` & `Premium+`):** Unlock advanced features like post editing, longer character limits, and a verification checkmark.
- **Bookmark Folders:** A premium feature allowing users to organize their bookmarked posts into custom folders.

### Music Integration
- **Artist Pages:** Dedicated pages for artists showcasing their popular tracks and listener statistics.
- **In-App Music Player:** A sleek, modal-based music player to play tracks from anywhere in the app.
- **Creator Studio:** A special section for verified artists to upload and manage their music, demonstrating role-based access control.

---

## Tech Stack

This project is built with a modern and powerful tech stack, chosen for performance, scalability, and developer experience.

- **Frontend:**
  - **Framework:** [Next.js](https://nextjs.org/) (with App Router)
  - **Language:** [TypeScript](https://www.typescriptlang.org/)
  - **UI Library:** [React](https://reactjs.org/)
  - **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  - **UI Components:** [ShadCN/UI](https://ui.shadcn.com/)

- **Backend & Database:**
  - **Platform:** [Firebase](https://firebase.google.com/)
  - **Database:** [Firestore](https://firebase.google.com/docs/firestore) (for all application data)
  - **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth) (Email/Password & Google OAuth)

- **Deployment:** [Vercel](https://vercel.com/)

---

## Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/chirpstream.git
cd chirpstream
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root of the project and add your Firebase project configuration. You can use the `.env.example` file as a template.

```sh
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

---
