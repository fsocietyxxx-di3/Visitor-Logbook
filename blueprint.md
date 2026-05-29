# Visitor Logbook Web System Blueprint

## Overview

This document outlines the plan for a complete Visitor Logbook Web System built from scratch using only HTML, CSS, and Vanilla JavaScript. The system operates without a backend, frameworks, npm, or build tools. All data will be stored in the browser's localStorage as an XML string.

## Core Features

*   **Dashboard:** Displays summary statistics and a full table of visitor records.
*   **Add Visitor:** A dedicated page with a form to add new visitors.
*   **Edit Visitor:** A dedicated page to edit existing visitor information.
*   **XML Data Layer:** All data is managed as an XML string in localStorage.
*   **Theme Toggle:** A light/dark mode toggle is available on all pages.
*   **Data Portability:** Import and Export visitor data via XML files.

## Functionality Details

### Dashboard
*   **Summary Cards:**
    *   Total Visitors
    *   Today's Visitors
    *   Currently Active
    *   Completed
*   **Visitor Table:**
    *   Columns: ID, Name, Purpose, Host, Contact, Date, Time In, Time Out, Status, Actions.
    *   Live search filtering by name or purpose.
    *   Visually distinct status indicators (Active, Completed, Pending).
    *   Edit and Delete buttons for each record.
    *   An "empty state" message when no data is available.

### Add Visitor Page
*   **Form Fields:** Full Name, Purpose of Visit, Person to Meet, Contact Number, Date, Time In, Time Out, Status.
*   **Auto-Generated ID:** Visitor ID in `V-001` format (readonly).
*   **Date Pre-fill:** Today's date is automatically filled.
*   **Validation:** All fields are required with inline error messages.
*   **On Submit:** A new XML visitor node is created and saved to localStorage. The user is then redirected to the dashboard.

### Edit Visitor Page
*   **Data Pre-fill:** The form is pre-filled with the data of the visitor being edited, identified by a URL parameter.
*   **Readonly ID:** The visitor ID cannot be changed.
*   **Validation:** All fields are required with inline error messages.
*   **On Save:** The corresponding XML visitor node is updated and saved to localStorage. The user is redirected to the dashboard.
*   **Error Handling:** If the visitor ID from the URL is not found, an error message is displayed and the form is disabled.

### Theme Toggle
*   **UI:** A toggle button with a sun/moon icon is present in the header on all pages.
*   **Functionality:** Switches the application between a light and a dark theme.
*   **Persistence:** The user's theme preference is saved in `localStorage` and applied on subsequent page loads.
*   **Default:** The default theme is light mode.

### XML Data Import/Export
*   **Location:** Dashboard page, near the visitor table controls.
*   **UI:** A button group containing "Export XML" and "Import XML" buttons.

*   **Export Functionality:**
    *   **Trigger:** Clicking the "Export XML" button.
    *   **Action:**
        1.  Retrieves the current visitor data from `localStorage`.
        2.  If data exists, it formats it into a human-readable XML string, including the `<?xml ... ?>` declaration.
        3.  Triggers a browser download of the data as a file named `visitors_export_YYYY-MM-DD.xml`.
        4.  If no data exists, it displays a notification instead of downloading a file.

*   **Import Functionality:**
    *   **Trigger:** Clicking the "Import XML" button, which opens a file selection dialog.
    *   **File Restriction:** The file picker only allows `.xml` files.
    *   **Validation Pipeline:** The selected file undergoes a series of strict validations:
        1.  **File Type:** Must be `.xml`.
        2.  **XML Parsing:** Must be a well-formed XML document.
        3.  **Root Element:** The root tag must be `<visitors>`.
        4.  **Node Integrity:** Each `<visitor>` must have all required child elements (`id`, `name`, `purpose`, `host`, `contact`, `date`, `time_in`, `time_out`, `status`).
        5.  **Data Formatting:**
            *   `<id>`: Must match `V-` followed by digits.
            *   `<date>`: Must be in `YYYY-MM-DD` format.
            *   `<status>`: Must be one of `Active`, `Completed`, or `Pending`.
            *   `<contact>`: Must be at least 7 digits.
        6.  **Uniqueness:** No duplicate `<id>`s are allowed within the imported file itself.
    *   **User Confirmation (Merge/Replace):**
        *   If validation passes, a modal appears detailing the import's impact (number of new vs. duplicate records).
        *   The user is given three choices:
            *   **Merge:** Add only the new records, skipping duplicates.
            *   **Replace:** Delete all current data and replace it with the imported data.
            *   **Cancel:** Abort the operation.
    *   **Feedback:**
        *   Specific, non-blocking error messages (toasts) are shown for any validation failure.
        *   Success messages are shown after a successful merge or replacement.

## Design System

*   **Aesthetic:** Editorial magazine-inspired, focusing on elegant typography, generous whitespace, and a restrained color palette.
*   **Themes:** 
    *   **Light Mode:** Warm ivory background, charcoal text, navy sidebar, and a gold accent.
    *   **Dark Mode (Original):** Near-black background, off-white text, and a brighter gold accent.
*   **Typography:**
    *   Headings: Playfair Display
    *   Body: Jost
*   **Components:**
    *   Sharp-edged buttons with letter-spacing.
    *   Minimalist table design.
    *   Smooth transitions on hover states.
*   **Responsiveness:**
    *   **Narrow Mobile (<480px):** Further reduced font sizes and padding. Import/Export buttons are vertically stacked.
    *   **Mobile (<768px):** Off-canvas sidebar, stacked cards, single-column forms, horizontally scrollable table. Import/Export buttons are vertically stacked.
    *   **Tablet (768px-991px):** Collapsed icon-only sidebar, two-column cards and forms. Import/Export buttons are side-by-side.
    *   **Desktop (>=992px):** Fully visible sidebar, four-column cards, full table view. Import/Export buttons are side-by-side.

## File Structure

*   `index.html` (Dashboard)
*   `add.html` (Add Visitor Form)
*   `edit.html` (Edit Visitor Form)
*   `style.css` (All styles)
*   `main.js` (All JavaScript logic)
*   `blueprint.md` (This file)
