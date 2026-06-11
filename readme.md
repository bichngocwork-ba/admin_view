# Game Support // Agent Portal - Technical Documentation

A high-performance, real-time administrative dashboard and support workspace designed for game support agents. This system is implemented using HTML5, Vanilla JavaScript, Tailwind CSS (utilizing Forms and Container Queries plugins), and Supabase SDK integration.

---

## 📌 Project Overview
The **Agent Portal** serves as the core interface for support teams to review player tickets, communicate resolutions, manage canned response templates, and maintain troubleshooting FAQs.

* **Core Stack**: HTML5, Vanilla JavaScript, Tailwind CSS.
* **Database & Auth**: Supabase real-time client SDK, bcryptjs-based password hashing verification.
* **UX/UI Highlights**: Persistent light/dark theme toggle, custom scrollbars, animated loading feedback, custom overlay modals, and responsive split-pane ticket workspace.
* **Security & RLS Resilience**: Row-Level Security (RLS) bypass deletion flows via OWNER-privilege database procedures and custom local draft caching fallbacks.

---

## 📂 File Directory & System Structure

The portal consists of the following key files:

| Filename | Component | Detailed Role & Logic |
| :--- | :--- | :--- |
| **[`login.html`](file:///e:/Documents/%C4%90%E1%BA%A0I%20H%E1%BB%8CC%20FTU/T%C3%80I%20LI%E1%BB%86U%20H%E1%BB%8CC/N%C4%82M%20BA/K%C3%8C%202/G%C4%902/C%C3%A1c%20v%E1%BA%A5n%20%C4%91%E1%BB%81%20%C4%91%C6%B0%C6%A1ng%20%C4%91%E1%BA%A1i%20trong%20KDS/admin/admin%20view/login.html)** | Secure Login Gate | Authenticates support agents using their email credentials. Dynamically imports Supabase client SDK and BCryptJS libraries. Has password visibility toggle (`visibility` vs `visibility_off`) and handles session caching in `localStorage`. |
| **[`index.html`](file:///e:/Documents/%C4%90%E1%BA%A0I%20H%E1%BB%8CC%20FTU/T%C3%80I%20LI%E1%BB%86U%20H%E1%BB%8CC/N%C4%82M%20BA/K%C3%8C%202/G%C4%902/C%C3%A1c%20v%E1%BA%A5n%20%C4%91%E1%BB%81%20%C4%91%C6%B0%C6%A1ng%20%C4%91%E1%BA%A1i%20trong%20KDS/admin/admin%20view/index.html)** | KPI Dashboard | Calculates queue metrics dynamically (unresolved counts, SLA percentages, Average Handle Time). Renders CSS status bar charts and SVGs for ticket categories. Integrates a custom dual-calendar date picker with range selection highlights. |
| **[`ticket_list.html`](file:///e:/Documents/%C4%90%E1%BA%A0I%20H%E1%BB%8CC%20FTU/T%C3%80I%20LI%E1%BB%86U%20H%E1%BB%8CC/N%C4%82M%20BA/K%C3%8C%202/G%C4%902/C%C3%A1c%20v%E1%BA%A5n%20%C4%91%E1%BB%81%20%C4%91%C6%B0%C6%A1ng%20%C4%91%E1%BA%A1i%20trong%20KDS/admin/admin%20view/ticket_list.html)** | Ticket Queue | Lists customer tickets in a data table. Features real-time client-side keyword search, filters for category and status, client-side pagination (10 items/page), and localStorage-based prefilter triggers. |
| **[`ticket_detail.html`](file:///e:/Documents/%C4%90%E1%BA%A0I%20H%E1%BB%8CC%20FTU/T%C3%80I%20LI%E1%BB%86U%20H%E1%BB%8CC/N%C4%82M%20BA/K%C3%8C%202/G%C4%902/C%C3%A1c%20v%E1%BA%A5n%20%C4%91%E1%BB%81%20%C4%91%C6%B0%C6%A1ng%20%C4%91%E1%BA%A1i%20trong%20KDS/admin/admin%20view/ticket_detail.html)** | Ticket detail Workspace | A split-pane workspace. Provides metadata display, parsed screening questions/answers, customer-agent chat feed, canned template insertion with conflict overwrite modal dialogues, local storage reply draft autosave, n8n webhook AI suggested reply fetching, and mail sending. |
| **[`response_templates.html`](file:///e:/Documents/%C4%90%E1%BA%A0I%20H%E1%BB%8CC%20FTU/T%C3%80I%20LI%E1%BB%86U%20H%E1%BB%8CC/N%C4%82M%20BA/K%C3%8C%202/G%C4%902/C%C3%A1c%20v%E1%BA%A5n%20%C4%91%E1%BB%81%20%C4%91%C6%B0%C6%A1ng%20%C4%91%E1%BA%A1i%20trong%20KDS/admin/admin%20view/response_templates.html)** | Canned Responses | Displays reply templates categorized by topic. Allows template search, copying content to clipboard, creating/editing templates within a nested detail modal, database deletion via secure RPC execution, and choosing active tickets to inject replies. |
| **[`add_response_template.html`](file:///e:/Documents/%C4%90%E1%BA%A0I%20H%E1%BB%8CC%20FTU/T%C3%80I%20LI%E1%BB%86U%20H%E1%BB%8CC/N%C4%82M%20BA/K%C3%8C%202/G%C4%902/C%C3%A1c%20v%E1%BA%A5n%20%C4%91%E1%BB%81%20%C4%91%C6%B0%C6%A1ng%20%C4%91%E1%BA%A1i%20trong%20KDS/admin/admin%20view/add_response_template.html)** | Add Template Form | Compose interface for canned templates. Features a simulated toolbar for simple text styles, single-click dynamic template placeholder buttons (`[Customer Name]`, `[Ticket ID]`), and support for publishing directly or saving drafts to local storage. |
| **[`faq_management.html`](file:///e:/Documents/%C4%90%E1%BA%A0I%20H%E1%BB%8CC%20FTU/T%C3%80I%20LI%E1%BB%86U%20H%E1%BB%8CC/N%C4%82M%20BA/K%C3%8C%202/G%C4%902/C%C3%A1c%20v%E1%BA%A5n%20%C4%91%E1%BB%81%20%C4%91%C6%B0%C6%A1ng%20%C4%91%E1%BA%A1i%20trong%20KDS/admin/admin%20view/faq_management.html)** | FAQs Management | Central knowledge repository interface. Groups support articles by technical department. Supports keyword searches, reading details or editing article titles/body content inside modals, draft management, and RPC deletions. |
| **[`add_faq_article.html`](file:///e:/Documents/%C4%90%E1%BA%A0I%20H%E1%BB%8CC%20FTU/T%C3%80I%20LI%E1%BB%86U%20H%E1%BB%8CC/N%C4%82M%20BA/K%C3%8C%202/G%C4%902/C%C3%A1c%20v%E1%BA%A5n%20%C4%91%E1%BB%81%20%C4%91%C6%B0%C6%A1ng%20%C4%91%E1%BA%A1i%20trong%20KDS/admin/admin%20view/add_faq_article.html)** | Add FAQ Article Form | Compose interface for technical articles. Features formatting tools (Bold, Italic, Underline shortcuts, H2/H3 header tag wrappers), category selectors, comma-separated keywords tag splitting, simulated screenshot file drag-and-drop, and draft saving options. |
| **[`shared.js`](file:///e:/Documents/%C4%90%E1%BA%A0I%20H%E1%BB%8CC%20FTU/T%C3%80I%20LI%E1%BB%86U%20H%E1%BB%8CC/N%C4%82M%20BA/K%C3%8C%202/G%C4%902/C%C3%A1c%20v%E1%BA%A5n%20%C4%91%E1%BB%81%20%C4%91%C6%B0%C6%A1ng%20%C4%91%E1%BA%A1i%20trong%20KDS/admin/admin%20view/shared.js)** | Core Utilities | Orchestrates theme updates (persisting Light/Dark mode classes on document root), session authorization gating, common HTML navigation header injection, globally styled toast notification animations, and local draft status flags synchronization. |
| **[`supabase-helper.js`](file:///e:/Documents/%C4%90%E1%BA%A0I%20H%E1%BB%8CC%20FTU/T%C3%80I%20LI%E1%BB%86U%20H%E1%BB%8CC/N%C4%82M%20BA/K%C3%8C%202/G%C4%902/C%C3%A1c%20v%E1%BA%A5n%20%C4%91%E1%BB%81%20%C4%91%C6%B0%C6%A1ng%20%C4%91%E1%BA%A1i%20trong%20KDS/admin/admin%20view/supabase-helper.js)** | Supabase SDK Helper | Manages real-time data sync, database inserts/updates, and description metadata parsing. Implements dynamic dependency fetching, bcrypt credential comparisons, RLS-resilient local storage fallback cache, status map constants, and deletion RPC wrappers. |

---

## 🔍 Deep Feature Analysis & System Capabilities

### 1. Secure Authentication Flow (`login.html` & `supabase-helper.js`)
* **Dynamic Dependency Loading**: Since SDK script tags are loaded on the client side, the portal uses `DB_Helper.init()` to dynamically inject and await JS files for `@supabase/supabase-js@2` and `bcryptjs@2.4.3` via CDN before triggering login calls.
* **Hashed Password Check**: Rather than sending plaintext credentials, the system pulls user data corresponding to the matching email from the `users` table and evaluates passwords locally using BCrypt:
  `bcrypt.compareSync(password, user.password_hash)`
* **Session Persistence**: Upon authentication, a structured `currentUser` payload is stored in `localStorage`:
  ```json
  {
    "id": "uuid-agent-id",
    "name": "Full Name",
    "role": "Support Agent / Senior Support Agent (Admin)",
    "status": "Active",
    "avatar": "avatar-link-url"
  }
  ```
  Unauthenticated attempts to access dashboard page templates redirect the browser to `login.html` via `checkAuth()`.

---

### 2. Real-Time KPI Dashboard & Metrics Engine (`index.html`)
The dashboard calculates support metrics dynamically based on synced tickets data:
* **SLA Compliance %**: Evaluates the percentage of unresolved tickets that are not currently flagged as overdue:
  $$\text{SLA Compliance} = \frac{\text{Total Unresolved} - \text{Overdue Unresolved}}{\text{Total Unresolved}} \times 100$$
* **Average Handle Time (AHT)**: Calculates handle times for resolved tickets:
  $$\text{AHT} = \frac{\sum_{i=1}^{n} \text{handleTime}_i}{n} \quad (\text{where } n = \text{count of resolved tickets})$$
  Defaulting missing parameters to a 15-minute standard threshold. Compares average against the default value (15.0m) and styles visual indicator arrows (`arrow_upward`/`arrow_downward`).
* **Category Navigation Prefiltering**: Clicking on unresolved counts by category triggers filters: it caches the selection in `localStorage.setItem('prefilter_category', category)` and redirects to the queue workspace where filter inputs parse and apply parameters on load.

---

### 3. Dynamic Visualizations & Math Rendering (`index.html`)
* **CSS Status Bar Chart**: Renders status counts (`Open`, `In Progress`, `Resolved`) dynamically. The height of each bar is styled using HSL-themed Tailwind metrics, scaled dynamically using maximum value boundaries:
  $$\text{Height \%} = \frac{\text{Status Count}}{\max(\text{Open}, \text{Drafting}, \text{Resolved})} \times 100$$
  This ensures the charts are proportioned to fit the card grids. Hover states toggle absolute-positioned tooltip layers.
* **SVG Pie Chart & Coordinate Trigonometry**: Divides ticket counts dynamically using coordinate arcs:
  * Computes the angle of the category slice: $\theta = \frac{\text{Category Count}}{\text{Total Tickets}} \times 360^\circ$
  * Converts polar coordinates to Cartesian coordinates to draw SVG boundaries:
    $$x_1 = 50 + 50 \times \cos\left(\frac{\text{Accumulated Angle} \times \pi}{180}\right)$$
    $$y_1 = 50 + 50 \times \sin\left(\frac{\text{Accumulated Angle} \times \pi}{180}\right)$$
  * Generates SVG path commands:
    `<path d="M 50 50 L x1 y1 A 50 50 0 largeArc 1 x2 y2 Z" fill="color"></path>`
  * Fallback handles distributions where a single category is $\ge 99.9\%$, drawing a complete SVG `<circle cx="50" cy="50" r="50">` wrapper. Custom tooltips track absolute cursor mouse positioning over path elements.

---

### 4. Custom Date Picker & Boundary Ranges (`index.html`)
Rather than relying on static limits or default calendar pickers, the portal implements a customized calendar overlay:
* **Dynamic Range Limits**: Calculates min and max ticket timestamps dynamically from Supabase ticket data at runtime, setting boundaries for calendar inputs.
* **Dual Calendar Grids**: Renders two calendars side-by-side representing start and end range boundaries. Select components let agents swap years (from 2020 to 2030) and months.
* **Highlight Render Logic**: Day selections apply visual indicators: active start/end dates get solid primary color backgrounds, while dates lying between selections receive a 10% opacity color block. Date formats are validated using regular expressions (`DD/MM/YYYY`).

---

### 5. Multi-Pane Split-Screen Ticket Detail Workspace (`ticket_detail.html`)
The workspace provides a split-pane layout to streamline ticket resolution:
* **Active Queue List**: The left column lists unresolved tickets (status `Open` or `Drafting`). Displays ticket IDs, status badges, customer names, and short description snippets. Clicking a queue card loads the ticket immediately without reloading the page.
* **Screening Metadata & Embed Parser**: Displays parsed answers to screening questions (e.g. system configurations, operating systems, issue types).
* **AI-Suggested Replies Webhook Integration**: Requests suggestions by posting ticket metadata to n8n webhook:
  * Target: `https://tamptc.app.n8n.cloud/webhook/suggest-reply`
  * JSON Payload structure:
    ```json
    {
      "message": "ticket_description",
      "customerName": "Customer Name",
      "customerEmail": "customer@email.com",
      "category": "Billing & Purchases",
      "priority": "High / Medium / Low",
      "ticketId": "TCK-12345"
    }
    ```
  * Displays loading progress animations (`progress_activity` spinner) during async calls and handles fallback retry states. One-click controls insert suggestions directly into the text editor.
* **Conflict-Detection Template Composer**: Handles template insertion safely. If the composer contains edits that differ from the template text, a dialog modal displays choices to Keep Draft or Overwrite content.
* **Mail Dispatcher and Resolution Webhook**: Sends replies via n8n sendmail webhook:
  * Target: `https://tamptc.app.n8n.cloud/webhook/sendmail`
  * JSON Payload structure:
    ```json
    {
      "action": "send_mail",
      "ticketId": "TCK-12345",
      "customerName": "Customer Name",
      "customerEmail": "recipient@email.com",
      "subject": "Re: ticket_subject",
      "replyText": "Composer reply text..."
    }
    ```
  * Upon a successful dispatch, it updates the ticket's database status to `Resolved` via `DB_Helper.saveTicketReply`, logs agent messages to conversation logs, and switches the composer view to a read-only "Resolved Ticket View Pane".
* **Local Draft Restoration Dialogs**: Unsaved draft text is cached in `localStorage` under `ticketDrafts` keyed by ticket id. If a user navigates away or reloads, the portal displays a modal asking whether to restore the unsaved draft or discard it. Saving drafts updates the ticket's status to `Drafting` in Supabase.

---

### 6. Embedded Metadata & Screening Question Parser (`supabase-helper.js`)
To maintain consistency when players submit tickets via external forms without structured parameters:
* The system utilizes a parser that matches markers (`-- Chi tiết danh mục --` or `-- Category Details --`) in the `description` body.
* It parses fields matching key-value pairs (e.g. `Operating System: Windows 11`) and maps them to technical classifications.
* **Sanitization Layer**: Once parsed, the raw metadata block is stripped from the description before rendering to the agent, keeping the interface clean and concise while preserving structured data in the sidebar.

---

### 7. RLS-Resilient Local Draft Syncing (`supabase-helper.js` & `shared.js`)
To ensure draft functionality works when database RLS policies block unauthenticated draft writes:
* Unsaved templates and FAQs are cached in local browser storage under `localDraftTemplates` or `localDraftArticles`.
* On data load, `syncTemplates` and `syncArticles` merge local drafts with published items fetched from the database:
  ```javascript
  const localDrafts = this.getLocalDraftArticles();
  localDrafts.forEach(draft => {
      const alreadyInDB = localDB.articles.find(a => a.id === draft.id);
      if (!alreadyInDB) {
          localDB.articles.push(draft);
      } else {
          this.removeLocalDraftArticle(draft.id);
      }
  });
  ```
* Once published to the database, drafts are cleared from local storage.

---

## 🎨 Theme & Accessibility Design System

* **Light/Dark Mode Root Toggling**: Uses a single theme control mechanism. The document switches color values by adding `light` or `dark` class wrappers to the `<html>` node. Selection state is saved in `localStorage.setItem('theme', 'dark')` and checked on page load to prevent style flicker.
* **Tailwind Custom HSL Theme Configuration**:
  ```javascript
  colors: {
    "error": "#ba1a1a", "primary-container": "#2563eb", "error-container": "#ffdad6",
    "on-error-container": "#93000a", "background": "#f6faff", "on-background": "#141d23",
    "on-primary": "#ffffff", "on-surface": "#141d23", "outline-variant": "#bcc9ce",
    "primary": "#004ac6", "primary-fixed": "#dbe1ff", "secondary-container": "#dee0e4",
    "surface-variant": "#dbe4ed", "surface-container-lowest": "#ffffff",
    "surface-dim": "#d2dbe4", "on-surface-variant": "#3d494d",
    "surface-container": "#e6eff8", "surface-container-high": "#e0e9f2",
    "surface-container-highest": "#dbe4ed", "surface-container-low": "#ecf5fe",
    "surface": "#f6faff", "inverse-surface": "#293138", "inverse-on-surface": "#e9f2fb",
    dark: { bg: "#0b1216", surface: "#111a22", "surface-container": "#18242e",
        "surface-container-high": "#1f2d3a", "surface-container-highest": "#273847",
        "surface-container-low": "#0d161d", "on-surface": "#f0f4f8",
        "on-surface-variant": "#a0b2c1", "outline-variant": "#344859", outline: "#526c81" }
  }
  ```
* **Aesthetic Polish Elements**: Form styling templates use container query plugins (`@tailwindcss/container-queries`), subtle box-shadow boundaries (`box-shadow: 0px 4px 24px rgba(0,0,0,0.03)`), transition animations on hovers, custom rounded border sizes, scrollbars styled to light/dark themes, and material-symbols icon integration.
