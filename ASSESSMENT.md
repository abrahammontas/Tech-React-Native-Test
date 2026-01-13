# Givebutter Senior Mobile Engineer Assessment

Welcome! This assessment is designed to evaluate your skills as a Senior Mobile Engineer. The project consists of a React Native Expo mobile app and a Node.js backend API.

## Project Overview

You'll be working on a simplified version of Givebutter's mobile app that displays fundraisers and allows users to make donations. The backend is **almost complete** - you only need to focus on the mobile app.

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

The backend will run on `http://localhost:3000`

### Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

4. Use the Expo Go app on your phone to scan the QR code, or press `i` for iOS simulator / `a` for Android emulator.

**Note:** If testing on a physical device, make sure your phone and computer are on the same network, and update the API URL in `mobile/src/services/api.ts` to use your computer's local IP address instead of `localhost`.

## Assessment Tasks

You have **2 tasks** to complete. Both tasks should be implemented in the `FundraiserDetailScreen.tsx` file.

### Task 1: Implement Donation Form

**Objective:** Create a donation form that allows users to make donations to a fundraiser.

**Requirements:**
- Add a donation form section in `FundraiserDetailScreen.tsx`
- The form should include:
  - Amount input field (numeric, required)
  - Donor name input field (required)
  - Optional message/comment field
  - Submit button
- Form validation:
  - Amount must be a positive number
  - Donor name is required
- On successful submission:
  - Show a success message/feedback
  - Refresh the fundraiser data to show updated raised amount
  - Clear the form
- Use the existing `api.createDonation()` function
- Handle loading and error states appropriately

**Bonus points for:**
- Smooth animations when showing success/error states
- Input field focus management
- Keyboard handling (dismissing keyboard on submit)
- Accessible form labels and error messages

### Task 2: Display Donations List

**Objective:** Display a list of recent donations for the fundraiser.

**Requirements:**
- Fetch and display donations using `api.getDonations()`
- Show donations in a scrollable list below the donation form
- Each donation item should display:
  - Donor name
  - Amount (formatted as currency)
  - Message (if provided)
  - Timestamp (formatted in a user-friendly way, e.g., "2 hours ago")
- Handle loading and error states
- After a successful donation (from Task 1), refresh the donations list

**Bonus points for:**
- Smooth list animations when new donations are added
- Pull-to-refresh functionality
- Empty state when there are no donations
- Nice visual design that matches the app's style

## Technical Guidelines

- Use TypeScript for all new code
- Follow React Native best practices
- Use React Hooks (useState, useEffect, etc.)
- Leverage React Query for data fetching and caching
- Ensure the UI is responsive and works on both iOS and Android
- Write clean, maintainable code
- Add comments where necessary to explain complex logic

## What We're Looking For

1. **Code Quality:** Clean, readable, well-structured code
2. **Mobile-First Thinking:** Consider mobile UX patterns and interactions
3. **Error Handling:** Proper handling of edge cases and errors
4. **Performance:** Efficient data fetching and rendering
5. **User Experience:** Smooth interactions and clear feedback
6. **Attention to Detail:** Polished UI that feels native

## Submission

Please submit:
1. Share your GitHub repository with completed code
2. A brief summary of your implementation approach
3. Any additional improvements or features you added (if any)
4. Screenshots or a short video demonstrating the functionality


