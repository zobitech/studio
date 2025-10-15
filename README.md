# AISight: AI Visibility Monitoring Tool

![AISight](https://storage.googleapis.com/aistudio-hosting.appspot.com/gallery/items/hEACApZ81i/screenshots/1.png)

## Is Your Website Invisible to AI?

**AISight** is a powerful, open-source web application designed to help website owners, marketers, and SEO professionals understand and improve their visibility within large language models (LLMs). In a world where AI is becoming a primary source of information, appearing in models like GPT, Copilot, and Perplexity is the new SEO frontier.

This tool allows you to run real-time tests to see if your website is cited as a source for specific prompts and provides AI-driven recommendations to boost your chances of being featured.

## ✨ Key Features

- **Instant Visibility Analysis:** Test any website URL against a user-defined prompt on multiple leading AI platforms simultaneously (GPT-4o mini, Copilot, Perplexity).
- **Real-Time Results:** Get immediate feedback on whether your site was "FOUND" or "NOT FOUND" in the AI-generated responses.
- **AI-Powered SEO Recommendations:** Receive a detailed, actionable list of SEO and content strategies tailored to improve your website's authority and trustworthiness in the eyes of AI models.
- **Performance Dashboard:** Visualize your results with clear charts and a summary, including an overall visibility score and platform-specific performance.
- **Test History:** Keep track of your recent tests to monitor improvements over time.
- **Frictionless Experience:** No sign-up or API keys required. All API calls are proxied for a seamless and free user experience.

## 🚀 How It Works

1.  **Enter Your Website URL:** The full URL of the site you want to test.
2.  **Provide a Test Prompt:** Enter a question or query you want the AI models to answer (e.g., "What are the best marketing agencies in New York?").
3.  **Run the Test:** Click "Test My Website Visibility" to initiate the scan.
4.  **Analyze & Act:** Review your visibility score, see which platforms cited your site, and dive into the expert recommendations to start improving your AI SEO.

## 💻 Live Preview

[![Deploy with Vercel](https://vercel.com/button)](https://aisight.vercel.app/)

Click the button above to see a live demo of the application.

## 🛠️ Tech Stack

This project is built with a modern, robust, and scalable tech stack:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [Shadcn/UI](https://ui.shadcn.com/) for beautiful, accessible components.
- **AI Integration:** [Genkit](https://firebase.google.com/docs/genkit) for defining and running the AI analysis flow.
- **Visualizations:** [Recharts](https://recharts.org/) for creating beautiful and responsive charts.
- **Server Actions:** For seamless client-server communication without needing to build a separate API.

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) or a compatible package manager

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will now be running on [http://localhost:9002](http://localhost:9002).

## 📄 Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack.
- `npm run build`: Creates a production-ready build of the application.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements, please feel free to open an issue or submit a pull request. Special thanks to [@rahimahkhan](https://github.com/rahimahkhan) for their contributions.
