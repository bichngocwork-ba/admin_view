# Game Support // Agent Portal

A high-performance, real-time administrative dashboard and workspace designed for customer support agents of a game publishing company. Built as a responsive web app using HTML5, Tailwind CSS, Vanilla JavaScript, and Supabase.

---

## 📌 Project Overview
The **Agent Portal** serves as the core interface for support teams to review player tickets, communicate resolutions, manage canned response templates, and maintain a troubleshooting knowledge base.

* **Core Stack**: HTML5, Vanilla JavaScript, Tailwind CSS (Form & Container query plugins).
* **Database & Auth**: Supabase real-time synchronization, secure bcrypt-based agent authentication.
* **UX/UI Highlights**: Harmonic curated light/dark themes, premium Outfit/Inter typography, responsive layouts, micro-animations, and custom scrollbars.
* **Security**: Role-based routing (Agent/Admin) and secure password verification.

---

## 📂 File Directory & System Structure

The portal consists of the following key files:

| Filename | Page / Component | Description |
| :--- | :--- | :--- |
| **`index.html`** | Ticket Dashboard | Main entry point displaying real-time support KPIs, date filters, status charts, and category metrics. |
| **`ticket_detail.html`** | Ticket Detail | Split-pane workspace to review player tickets, check parsed screening questions, query AI-suggested responses, and compose email replies. |
| **`ticket_list.html`** | Ticket Queue | Searchable queue listing all customer support tickets with filters for status, category, and pagination. |
| **`login.html`** | Secure Portal Login | High-security gate verifying agent credentials against Supabase using bcryptjs encryption. |
| **`response_templates.html`** | Canned Responses | Management dashboard to search, view, and organize quick-reply email templates. |
| **`add_response_template.html`** | Add Template Form | Standardized compose form supporting dynamic placeholders (e.g., `{customer_name}`). |
| **`knowledge_base_management.html`**| Knowledge Base | Wiki repository for troubleshooting guides, connection fixes, and billing rules. |
| **`add_knowledge_base_article.html`**| Add KB Article | Drafting interface to write and keyword-tag troubleshooting guides. |
| **`shared.js`** | Shared Core Utilities | Manages theme toggling, global active navigation header injection, authentication checks, and toast alerts. |
| **`supabase-helper.js`** | Supabase SDK Helper | Manages real-time data sync, updates ticket states, posts resolutions, and runs description metadata parsing. |

---

## ⚙️ Key Technical Implementations

### 1. Embedded Metadata Parsing (Fallback Parser)
When user tickets are created without structured table fields in `ticket_question_answers`, the system uses a fallback parser inside [supabase-helper.js](file:///c:/Users/ADMIN/Downloads/admin%20view/supabase-helper.js):
* Scans the ticket description for category detail markers (e.g., `-- Chi tiết danh mục --` or `-- Category Details --`).
* Dynamically extracts screening questions (like `Operating System`, `Issue Type`, `Graphics / CPU Brand`, `Error Code`).
* Maps these values to update the `PLATFORM` metadata slot (e.g., rendering `Windows 11` instead of `Unknown OS`).
* Strips the raw metadata text from the description to display clean problem reports in the **ISSUE DESCRIPTION**.

### 2. Real-time Dashboard KPIs & Dynamic Range
* The dashboard date-picker dynamically adjusts its start and end date range at runtime based on the timestamps of synced tickets in the database.
* Recalculates metrics (**Total Unresolved Tickets**, **SLA Compliance %**, **Average Handle Time**) in real-time.

### 3. AI-Assisted Workflows
* Integrating webhook calls to n8n to analyze ticket content and return tailored drafts.
* Features a loading spinner showing `Đang lấy phản hồi từ AI...` (Retrieving response from AI...) during generation, with a one-click `APPLY DRAFT` insert button.

---

## 🎨 Theme & Accessibility
* **Theme Toggle**: Real-time switching between Light and Dark mode using the `light` and `dark` classes on the `<html>` root, persisted in the browser's local storage.
* **Aesthetics**: Curved panels, micro-shadows, responsive grid wrappers, hover glows, and smooth transitions on active triggers.
