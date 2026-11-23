# Study Command Center

Build a web application called "Winston's Command Center" designed specifically as a single-hub dashboard for a college student with severe ADHD. The application must feature a step-by-step onboarding wizard to set up integrations, followed by a permanent, low-maintenance home dashboard that aggregates university tools.

### 1. DESIGN & UX PRINCIPLES FOR ADHD
- **Visual Clutter Reduction:** Use a clean, calming UI (minimalist aesthetic, deep blues/greens, generous white space) to prevent sensory overload. 
- **High Scannability:** Use large typography, clear visual hierarchies, and progress indicators.
- **Micro-Reward System:** Include subtle, satisfying animations when tasks or onboarding steps are completed.
- **Zero-Maintenance Goal:** The student should rarely have to manually input data after the initial setup.

### 2. INITIAL ONBOARDING WIZARD (Step-by-Step Questions)
When a user logs in for the first time, present a beautiful, multi-step wizard (one simple question per screen):
- **Step 1 (Welcome):** "Welcome, Winston. Let's get your semester automated."
- **Step 2 (Canvas Sync):** Ask for their Canvas Calendar Feed URL. Provide clear, visual instructions or an embedded GIF showing where to find it in Canvas. Include an input field to paste the URL.
- **Step 3 (Google Workspace Connection):** Provide a mock button/OAuth flow to "Connect Google Calendar." Explain that this allows the app to schedule intelligent alerts.
- **Step 4 (Academic Hubs):** Allow the user to input the URLs for their class NotebookLM notebooks (e.g., Class Name -> Notebook Link). Allow adding multiple classes dynamically.

### 3. THE PERMANENT HOME DASHBOARD
Once onboarding is complete, the app defaults to this dashboard view, divided into three clean columns or cards:

#### Card A: "What's Next?" (Automated Schedule & Reminders)
- Display a unified timeline pulling from the synced Canvas feed.
- **Intelligent Reminders Engine:** For every assignment pulled from Canvas, automatically generate a tiered notification strategy:
  - Lead-Time Alert 1: 2 weeks out (Visual tag: "On the Horizon")
  - Lead-Time Alert 2: 1 week out (Visual tag: "Incoming")
  - Lead-Time Alert 3: 2 days out (Visual tag: "Focus Time")
- Include a simulated toggle or webhook configuration to send these alerts as push notifications or SMS via Twilio/Firebase Cloud Messaging.

#### Card B: "My Second Brain" (Note-to-Task Linking)
- Display the user's active courses. 
- Next to each course, show a quick-launch button that opens their designated NotebookLM link in a new tab.
- Automatically match incoming Canvas assignments to their corresponding class NotebookLM hub based on the course code/name.

#### Card C: "The Daily Reset" (Gemini Prompt Copier)
- A dedicated card featuring a "One-Click Copy" button for Winston's morning routine.
- The button copies a pre-formatted prompt to his clipboard so he can paste it directly into his Gemini app: 
  *"@Google Calendar, give me a hyper-focused overview of my schedule today and tell me the single most critical assignment I should start working on early to beat my ADHD time-blindness."*

### 4. TECHNICAL SPECIFICATIONS & SIMULATION
- Create clean, modular React components for the Dashboard, Wizard, and Course Cards.
- Implement a simulated backend state using local storage so that when Winston completes the onboarding wizard, his custom configuration, Canvas URL, and Notebook links persist across browser refreshes.
- Provide a settings page where he can easily update his Canvas feed or add new NotebookLM URLs for future semesters.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://command-zen-dashboard.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4df5440b-2814-47b5-9cee-60dd657fee25).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
