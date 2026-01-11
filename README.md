# Crypto Exchange Platform

A modern full-stack cryptocurrency exchange application that simulates real-world trading using live market data, secure authentication, and a functional wallet system.

---

## Overview

This project is built to closely replicate the core workflows of a real crypto exchange — from user onboarding and wallet balance management to real-time price tracking and live transaction execution. It is designed as a strong full-stack portfolio project with emphasis on scalability, API integration, and clean architecture.

---

## Features

* **User Authentication**

  * Secure sign-up and sign-in flow
  * First-time users are prompted to create an account

* **Real-Time Market Data**

  * Live cryptocurrency prices and charts
  * Data fetched directly from the Coinbase API

* **Wallet System**

  * Auto-funded trial wallet with $1000 virtual balance
  * Real-time balance updates after every transaction

* **Live Trading Simulation**

  * Buy and sell crypto using real-time prices
  * No mock data — all transactions are API-driven

* 🧾 **Transaction History**

  * Only real, session-based transactions are shown
  * Old or static records are cleared automatically

* ⚡ **Responsive UI**

  * Clean, modern interface
  * Optimized for desktop and mobile devices

---

## Tech Stack

**Frontend**

* React / Next.js
* Tailwind CSS
* Charting Libraries (for live charts)

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB / Supabase

**APIs**

* Coinbase API (real-time crypto prices)

---

## 📂 Project Structure

```
Crypto/
├── public/          # Static assets
├── screenshots/     # Project screenshots
├── src/             # Frontend source code
├── server/          # Backend logic & APIs
├── .env.example     # Environment variable template
├── package.json
└── README.md
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Sohum-Nikam/Crypto.git
cd Crypto
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file using `.env.example` and add your API keys.

### 4. Run the Application

```bash
npm run dev
```

---

## Purpose

This project demonstrates:

* Full-stack system design
* Secure authentication flows
* Real-time API integration
* Wallet and transaction logic
* Clean UI/UX principles

It is ideal for showcasing skills in **full-stack development**, **API handling**, and **real-time data systems**.

## 🤝 Contributions

Contributions, issues, and feature requests are welcome. Feel free to fork the repository and submit a pull request.

---

## ⭐ Support

If you found this project helpful or inspiring, consider giving it a ⭐ on GitHub!
