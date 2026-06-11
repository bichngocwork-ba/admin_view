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

## ⚙️ Key Technical Implementations

### 1. Embedded Metadata Parsing (Fallback Parser)
When user tickets are created without structured table fields in `ticket_question_answers`, the system uses a fallback parser inside [supabase-helper.js](file:///e:/Documents/ĐẠI%20HỌC%20FTU/TÀI%20LIỆU%20HỌC/NĂM%20BA/KÌ%202/GĐ2/Các%20vấn%20đề%20đương%20đại%20trong%20KDS/admin/admin%20view/supabase-helper.js):
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

### 4. Local Storage Fallback & Draft Merging Mechanism
Since RLS policies might block anonymous or basic users from saving draft templates/articles directly to the cloud DB, the system saves drafts locally in `localStorage` and dynamically merges them with the cloud database items in memory upon page loading:
* `localDraftTemplates` stores draft response templates.
* `localDraftArticles` stores draft FAQ articles.
* When synced from Supabase, `syncTemplates` and `syncArticles` fetch all published cloud items and merge them with locally stored drafts to create a unified UI experience. Once an item is published, it is moved from local storage to the database.

### 5. Security Definer RPC for Safe Deletions
Deleting templates and articles is performed via RPC calls (to bypass table-level RLS policies that disallow direct DELETE operations by agent clients):
* Directly calling `.delete()` on restricted tables will fail due to permissions.
* The system invokes `.rpc('delete_kb_article', { article_id: id })` or `.rpc('delete_response_template', { template_id: id })` which run with `SECURITY DEFINER` privileges in PostgreSQL.

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
