# Fundraiser Donation Flow – Implementation Summary

## Repository

**Repository URL:**  
https://github.com/abrahammontas/Tech-React-Native-Test

---

## Task 1 – Donation Flow Implementation

### Overview

Task 1 implements a full donation flow in `FundraiserDetailScreen.tsx`. Users can select a preset amount or enter a custom value, provide their name and an optional message, and submit a donation. The form integrates with the backend API, validates input, and handles success and error states. When the fundraiser goal is reached, the donation form is hidden and replaced with a celebratory "Goal reached" card.

**Key features:**

- Donation form with preset amounts ($10, $25, $50, $100, $250) and Custom option
- API integration via `api.createDonation()`
- Success: query invalidation, form reset, success message
- Error handling for validation, network, and backend errors
- Validation of amount limits (positive, ≤ remaining campaign amount, ≤ $100,000)
- UI states for loading, success, error, and goal reached

### Technical Approach

**Component structure:**  
The form is built from reusable pieces: `AmountSelector`, `AmountButton`, `DonateInput`, and `DonateButton`. Logic stays in the screen component.

**State management:**  
React `useState` for form fields (`selectedAmount`, `customAmount`, `donorName`, `message`), validation errors (`amountError`, `donorNameError`, `submitError`), and UI state (`donateSuccess`, `descriptionExpanded`).

**API integration:**  
React Query `useMutation` calls `api.createDonation(fundraiserId, payload)`. On success, it invalidates `['fundraiser', fundraiserId]` and `['donations', fundraiserId]` to refresh data.

**Error handling:**  
`parseDonationError()` uses `axios.isAxiosError()` to distinguish network errors, 400 validation errors (with backend messages), and generic failures. Errors are shown inline above the Donate button.

**Validation logic:**

- Amount: positive, ≤ remaining goal, ≤ $100,000
- Name: required, 2–100 characters
- Real-time validation for amount and name with inline messages

---

## Task 2 – Donations List and UX Improvements

### Overview

Task 2 displays a list of recent donations below the donation form as a social-proof section. The implementation uses React Query for data fetching, handles all edge cases, and provides a polished mobile experience.

### UX and UI (Task 2)

- Donations are displayed below the donation form as a social-proof section ("Recent donations")
- Amount is formatted as currency (e.g., $10, $25.50, $1,000)
- Timestamp is formatted in a user-friendly relative format (e.g., "Just now", "2h ago", "3d ago")
- Message is shown only when provided, clamped to 2 lines with ellipsis
- Loading, error (with retry), and empty states are implemented
- Pull-to-refresh is supported on the main scroll view
- Smooth insertion animations for new donations (LayoutAnimation when list length increases)
- After successful donation, donations list refreshes via React Query invalidation (`queryClient.invalidateQueries(['donations', fundraiserId])`)
- Auto-refresh when the section becomes visible (throttled to 30s) when data is stale
- "Updated Xm ago" indicator; tappable to refresh; shows spinner while fetching

### Technical Notes (Task 2)

- **React Query:** `queryKey` includes `fundraiserId`: `['donations', fundraiserId]`; `queryFn` uses `api.getDonations(fundraiserId)`; `staleTime: 30000`
- **TypeScript:** Explicit types for `Donation`, `DonationsApiResponse`, and component props; optional fields (`message`, `createdAt`) handled defensively
- **FlatList performance:** Stable `keyExtractor` using donation `id` (fallback to composite key); memoized `renderItem` with `useCallback`; `DonationRow` wrapped in `React.memo`
- **Scroll stability:** `scrollEnabled={false}` on donations FlatList (nested inside parent ScrollView) to avoid scroll conflicts; scroll position preserved during refetch; `maintainVisibleContentPosition` on iOS to reduce layout jumps

---

## UX and UI Improvements (Task 1)

Focuses on usability, conversion, and modern UX patterns.

### Floating Donate CTA

- A floating "Donate" button appears only when the donation form is not visible on screen.
- Visibility is driven by scroll position and the form's layout (`onScroll`, `onLayout`, `useWindowDimensions`).
- The CTA hides when the form is in view.
- Tapping the CTA scrolls to the donation section.
- The CTA is not shown when the goal is reached or after a successful donation.

**Benefits:**

- Reduces scrolling to reach the form
- Keeps a clear path to donate
- Avoids duplicate CTAs when the form is visible

### Collapsible Description (Read More / Read Less)

- The fundraiser description is limited to 3 lines by default.
- "Read more" expands to show the full text.
- "Read less" collapses back to 3 lines.
- Uses `numberOfLines` and `ellipsizeMode` for truncation.

**Benefits:**

- Keeps the layout compact
- Reduces initial scrolling
- Lets users expand only when needed

### Modern Donation Form Enhancements

- **Preset amount selector:** Buttons for $10, $25, $50, $100, $250 and Custom, with selected state and scale animation.
- **Custom amount:** Numeric input when Custom is selected.
- **Dynamic Donate button:** Text updates to "Donate $25 ❤️" (or the selected amount).
- **Layout:** Card-style form, spacing, rounded corners, subtle shadow.
- **Validation:** Inline errors, amount ≤ remaining goal, real-time feedback.

---

## Additional Improvements

- **Animations:** LayoutAnimation for form expansion, Animated for amount buttons and Donate button press.
- **Goal reached UI:** Dedicated card with "Goal reached!" and confetti-style animation.
- **Success state:** Dedicated success view with "Donation successful 🎉" and placeholder for confetti.
- **Floating labels:** Labels above inputs instead of placeholders.
- **Auto-scroll:** Scroll to the form when an amount is selected.
- **Backend error visibility:** 400 responses surfaced with backend messages instead of generic errors.

---

## Screenshots / Demo

### Task 1 — Donation Form

![Donation Form](frontend/assets/tasks/task1/donate_form.png)

### Task 1 — Read More / Read Less

![Read More](frontend/assets/tasks/task1/read_more.png)

### Task 1 — Goal Reached

![Goal Reached](frontend/assets/tasks/task1/goal_reached.png)

### Task 1 — Donation Successful

![Donation Successful](frontend/assets/tasks/task1/donation_successfull.png)

### Task 2 — Donations List (Screenshots / Video)

![Task 2 - Recent donations](frontend/assets/tasks/task2/recent_donations.png)

![Task 2 - New donation](frontend/assets/tasks/task2/new_donation.png)

[Task 2 Demo Video - Pull to refresh](frontend/assets/tasks/task2/pull_to_refresh_video.mov)

---

## Summary

The implementation emphasizes:

- **Modern UX:** Preset amounts, floating CTA, collapsible description, donations list with pull-to-refresh, and clear feedback.
- **Clean architecture:** Reusable components, clear state handling, separation of concerns, and typed API responses.
- **Conversion optimization:** Reduced friction, visible CTA, progressive disclosure, and social proof via recent donations.
- **Robust error handling:** Backend and network errors surfaced with clear, actionable messages; retry for donations list.
- **Performance:** Memoized list items, stable keys, and scroll stability to avoid layout jumps.
