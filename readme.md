# Game Support // Agent Portal

A high-performance, real-time administrative dashboard and support workspace designed for customer support agents of a game publishing company. Built as a responsive web app using HTML5, Tailwind CSS, Vanilla JavaScript, and Supabase integration.

---

## 📌 Project Overview
The **Agent Portal** serves as the core interface for support teams to review player tickets, communicate resolutions, manage canned response templates, and maintain troubleshooting FAQs.

* **Core Stack**: HTML5, Vanilla JavaScript, Tailwind CSS (utilizing Form & Container query plugins for responsive grids).
* **Database & Auth**: Supabase real-time synchronization, secure bcryptjs-based agent authentication.
* **UX/UI Highlights**: Harmonic light/dark themes, premium typography, responsive layouts, micro-animations, custom scrollbars, and modal dialogue overlays.
* **Security**: Role-based access control (Support Agent / Senior Support Admin) and row-level security (RLS) policies.

---

## 📂 File Directory & System Structure

The portal consists of the following key files:

| Filename | Page / Component | Description |
| :--- | :--- | :--- |
| **`index.html`** | Ticket Dashboard | Main entry point displaying real-time support KPIs, date filters, status charts, and category metrics. |
| **`ticket_list.html`** | Ticket Queue | Searchable queue listing all customer support tickets with filters for status, category, priority, and client pagination. |
| **`ticket_detail.html`** | Ticket Detail Workspace | Split-pane workspace to review player tickets, check parsed screening questions, query AI-suggested responses, and compose email replies. |
| **`login.html`** | Secure Portal Login | High-security gate verifying agent credentials against Supabase using bcryptjs encryption. |
| **`response_templates.html`** | Canned Responses | Management dashboard to search, view, and organize quick-reply email templates. |
| **`add_response_template.html`** | Add Template Form | Standardized compose form supporting dynamic placeholders (e.g., `{customer_name}`). |
| **`faq_management.html`** | FAQs Management | Wiki repository to organize support articles under technical categories, handle searches, and manage drafts. |
| **`add_faq_article.html`** | Add FAQ Article Form | Drafting interface to write and keyword-tag troubleshooting guides. |
| **`shared.js`** | Shared Core Utilities | Manages theme toggling, global active navigation header injection, authentication checks, local draft synchronization, and toast alerts. |
| **`supabase-helper.js`** | Supabase SDK Helper | Manages real-time data sync, database inserts/updates, and description metadata parsing. |

---

## 🔍 Deep Feature Analysis & System Capabilities

### 1. Real-time KPI Dashboard & Metrics Engine (`index.html`)
The dashboard calculates support metrics dynamically in the browser based on synced data from Supabase:
* **SLA Compliance %**: Calculated dynamically as:
  $$\text{SLA Compliance} = \frac{\text{Total Unresolved Tickets} - \text{Overdue Tickets}}{\text{Total Unresolved Tickets}} \times 100$$
  This allows team leads to instantly evaluate whether the support queue is meeting responsiveness agreements.
* **Average Handle Time (AHT)**: Averaged over all resolved tickets in the current active filter range:
  $$\text{AHT} = \frac{\sum \text{handle\_time for each resolved ticket}}{\text{Count of resolved tickets}}$$
* **Interactive Date-Range Boundaries**: Instead of static calendar limits, the date picker reads the oldest and newest ticket timestamps from the live database at runtime and sets the date bounds dynamically.

### 2. Embedded Metadata & Screening Question Parser (`supabase-helper.js`)
To maintain consistency when players submit tickets via external forms without structured parameters:
* The system utilizes a parser that matches markers (`-- Chi tiết danh mục --` or `-- Category Details --`) in the `description` body.
* It parses fields matching key-value pairs (e.g. `Operating System: Windows 11`) and maps them to technical classifications.
* **Sanitization Layer**: Once parsed, the raw metadata block is stripped from the description before rendering to the agent, keeping the interface clean and concise while preserving structured data in the sidebar.

### 3. AI-Assisted Resolution Workflows (`ticket_detail.html`)
* **Contextual Analysis**: Sends ticket metadata (game category, description, and custom questions) to an external webhook (n8n).
* **Smart Insertion**: The AI-suggested draft is fetched asynchronously, displaying a spinner with the label `Đang lấy phản hồi từ AI...`. Agents can review the suggestion and click a single button to auto-insert it into the email composer.

### 4. Resilience through Local Draft Syncing (`shared.js` & `supabase-helper.js`)
To prevent data loss from network interruptions or authentication changes:
* When an agent drafts a reply or article, it is automatically cached in `localStorage` under `localDraftTemplates` or `localDraftArticles`.
* Upon reloading the page, the client merges local drafts with published items fetched from the Supabase API.
* Once published, draft items are safely cleared from local storage and written permanently to the cloud DB.

### 5. Canned Template Engine with Placeholder Parsing (`response_templates.html`)
* **Shortcuts**: Supports quick filtering of email replies using shortcut tags (e.g. `/payment`, `/refund`).
* **Variable Interpolation**: Dynamically replaces placeholders like `{customer_name}` or `{game_name}` at runtime with the specific ticket details before injecting the template text into the agent's composer.

---

## ⚙️ Key Technical Implementations

### 1. Security Definer RPC for Safe Deletions
Deleting templates and articles is performed via RPC calls (to bypass table-level RLS policies that disallow direct DELETE operations by agent clients):
* Directly calling `.delete()` on restricted tables will fail due to permissions.
* The system invokes `.rpc('delete_kb_article', { article_id: id })` or `.rpc('delete_response_template', { template_id: id })` which run with `SECURITY DEFINER` privileges in PostgreSQL.

### 2. Secure Bcrypt Authentication
* Front-end handles password verification securely using the `bcryptjs` library.
* Verifies agent passwords against hashed records in the database (`bcrypt.compareSync(password, user.password_hash)`), preventing plaintext password leakage.

---

## 🎨 Theme & Accessibility
* **Theme Toggle**: Real-time switching between Light and Dark mode using the `light` and `dark` classes on the `<html>` root, persisted in the browser's local storage.
* **Aesthetics**: Curved panels, micro-shadows, responsive grid wrappers, hover glows, and smooth transitions on active triggers.

---

## 🛠 Database Schema & SQL Setup Recommendations

To configure the database for this portal, run the following SQL commands in your Supabase SQL Editor:

```sql
-- 1. Create delete function for FAQ articles to bypass direct RLS blocks
CREATE OR REPLACE FUNCTION delete_kb_article(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges
AS $$
BEGIN
    DELETE FROM knowledge_base_articles WHERE id = article_id;
END;
$$;

-- 2. Create delete function for response templates to bypass direct RLS blocks
CREATE OR REPLACE FUNCTION delete_response_template(template_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges
AS $$
BEGIN
    DELETE FROM response_templates WHERE id = template_id;
END;
$$;
```
