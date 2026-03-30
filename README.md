# LifeLens

Personal review & re-strategy planner. Score 9 life areas, reflect on tailored prompts, and get AI-powered insights — weekly, monthly, or quarterly.

## Quick Start

```bash
npm install
npm run dev
```

Add your [Gemini API key](https://aistudio.google.com/app/apikey) to `.env`:

```
VITE_GEMINI_API_KEY=your_key_here
```

## EmailJS (Optional)

For email reminders, create a free [EmailJS](https://www.emailjs.com/) account and enter your credentials in **Settings**.

Template variables: `{{to_email}}`, `{{review_type}}`, `{{motivational_line}}`, `{{message}}`, `{{app_name}}`

## Build

```bash
npm run build
```

## Stack

React (Vite) · Tailwind CSS · Chart.js · Gemini API · EmailJS · vite-plugin-pwa · localStorage
