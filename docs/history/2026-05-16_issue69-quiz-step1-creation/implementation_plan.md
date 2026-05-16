# Step 1/3: Introduce Multi-Bank Rules and Quiz Upload UI

Initiate the Quiz Master multi-bank refactoring through a safe, isolated first baby step. Establish database security rules for `/admin/quizBanks` and introduce custom JSON file upload and schema template download interfaces without disrupting legacy DOM variables or active gameplay controls.

## User Review Required
Please review the database security rules and the UI form layout for Quiz Bank creation.

## Proposed Changes

### 1. Database Security Rules (`database.rules.json`)
- Grant explicit read (`auth != null`) and host admin write (`wube8816@gmail.com`) permissions for `/admin/quizBanks`.

### 2. Dashboard Creation UI (`admin.html`)
- Retain legacy Quiz buttons (`btn-quiz-upload`, `btn-quiz-default`, `auto-jump-input`, etc.) inside a hidden container to guarantee zero `ReferenceError` exceptions during script initialization.
- Introduce a new persistent bank creation form featuring topic name input, auto-jump timer input, a hidden `<input type="file">`, and button triggers (`+ Save Quiz Bank`, `Download Template`).

### 3. File Handling & Storage Mechanics (`admin.js`)
- Declare new DOM variables for the creation form.
- Implement standard JSON template downloading via dynamic `Blob` generation.
- Implement client-side JSON validation and persistent committing to `/admin/quizBanks`.

## Verification Plan

### Manual Verification
- Open `admin.html`. Verify the UI cleanly displays the new Quiz Bank creation form while legacy controls remain hidden.
- Click `Download Template`. Verify `quiz_template.json` successfully downloads.
- Input topic `"2026 Tech Trivia"`, timer `"10"`, select the downloaded JSON file, and click `+ Save Quiz Bank`. Verify the bank successfully saves into Firebase without console errors.
