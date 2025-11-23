# **LazyMe – 10-Step High-Level Build Plan (with Colors)**

### **1. Initialize the Project**

Set up a new modern React-based app (e.g., Next.js + TypeScript + Tailwind). Initialize Git and prepare a clean project structure.

---

### **2. Configure Supabase**

Create a Supabase project, add the project URL + anon key to environment variables, and set up a shared Supabase client.

---

### **3. Create the Database Schema**

In Supabase, build tables for:

* **Categories**
* **Todos**
  Include fields for timestamps, due dates, timer settings, notes JSON, links JSON, and associations with the logged-in user. Add indexes for performance.

---

### **4. Implement User Authentication**

Set up Supabase Auth for login (magic link or password), handle logout, and ensure authenticated session checks are in place for protected routes.

---

### **5. Build the Core App Layout**

Create:

* A **sidebar** showing categories + todos
* A **main content view** showing the dashboard, next task, or todo details

Apply your **UI theme**:

* **Backgrounds:** `#242424`, `#2b2b2b`
* **Accent colors:**

  * Pink: `#ff68a6`
  * Orange: `#ff7800`
  * Purple: `#9a86ff`
  * Aqua: `#01eab9`
  * Blue: `#01aaff`

---

### **6. Categories & Todo Management**

Allow users to:

* Create categories
* Add/edit/delete todos
* Assign times (created, start, due, completed)
* Add descriptions, links, and timer presets
* Store notes canvas data inside each todo

---

### **7. Implement "Next Task" Logic**

Define a function that identifies the **next upcoming todo** based on:

* Due date/time
* Status (pending or in-progress)
  Show this prominently on the dashboard.

---

### **8. Add Timer Functionality**

Include:

* Countdown timer with presets + custom durations
* Start/pause/reset controls
* Audio alerts when time finishes
* Optional auto-marking or suggestions for completion

---

### **9. Add Links & Notes Canvas**

For each todo:

* Allow embedding website links (word-linked)
* Auto-embed YouTube if URL detected
* Provide a **notes canvas** (Milanote-style):

  * Add text notes
  * Add images
  * Drag to reposition
  * Save as JSON in Supabase

---

### **10. Build the Calendar View**

Create a **Jira-like calendar** where users can:

* Assign tasks to specific days
* View daily, upcoming, overdue, and completed tasks
* Navigate by month/week
* Create or reschedule tasks from the calendar

Calendar uses the same color palette and dark UI base.
