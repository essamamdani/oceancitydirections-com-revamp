# Claim Business Process Documentation

## Overview
This document outlines the technical flow of the "Claim this Business" feature in the application.

## 1. User Action: Claiming a Business
When a user clicks the **"Claim this Business"** button on a listing page:

1.  **UI Trigger**: The `handleClaim` function in `SingleListingsContent.js` is triggered.
2.  **API Call**: A `POST` request is sent to `/api/claims/save`.
    *   **Payload**:
        *   `business_id`: ID of the business being claimed.
        *   `proposed_data`: Current details of the business (title, phone, address, etc.).
        *   `proposed_update_slug`: Slug for the business.

## 2. Backend Processing (`/api/claims/save`)
The API endpoint handles the request as follows:

1.  **Validation**: Checks if the user is logged in and if required fields exist.
2.  **Business Check**:
    *   Verifies if the business exists in the `businesses` table.
    *   Checks if the business is **already claimed and approved** by another user. If so, it returns a 403 error.
3.  **Database Update (`claim_businesses`)**:
    *   Inserts a new record into the `claim_businesses` table.
    *   Sets status to `'pending'`.
4.  **HubSpot Integration**:
    *   Calls `pushClaimLead` (in `src/lib/actions.js`).
    *   **Creates/Updates Contact**: Pushes the user's details (Name, Email, Phone) to HubSpot.
    *   **Creates Task**: Creates a task in HubSpot for the admin team.
        *   **Subject**: `business_claim_leads`
        *   **Status**: `WAITING`
        *   **Priority**: `HIGH`
        *   **Body**: Contains details of the claimant and the business.

## 3. Post-Action (User Side)
*   **Success Message**: The user sees a toast notification: "Claim created. Redirecting to dashboard...".
*   **Redirect**: The user is redirected to `/dashboard`.
*   **Dashboard View**: The user can see their claim status (Pending/Under Review) via `/api/claims/list` which queries the `claim_businesses` table.

## 4. Admin Workflow (Approval/Rejection)
*   **Notification**: The Admin receives the claim via **HubSpot Task**. There is **no direct email** sent to an admin email address in this flow (handled via CRM).
*   **Approval Process**:
    *   There is currently **no automated "Approve" button** in the provided codebase.
    *   **Action**: The Admin must manually verify the claim (likely by contacting the user via Phone/Email from HubSpot).
    *   **Finalization**: To approve, the Admin likely performs a manual database update or uses an external tool to:
        1.  Update `claim_businesses` status to `'approved'`.
        2.  Update `businesses` table:
            *   Set `claimed_by` to the User's ID.
            *   Set `claimed_approval` to `true`.
            *   Set `is_claimed` to `true`.

## 5. Notifications to User
*   **Automated Emails**: There is **no code** in the repository that automatically sends an approval or rejection email to the user when the status changes.
*   **Communication**: The Admin is expected to communicate the decision manually or via HubSpot workflows.

## 6. Website Updates
*   **Timeline**: The business listing updates **immediately** after the Admin updates the database.
*   **Changes on Site**:
    *   The **"Unclaimed"** badge is removed.
    *   A **"Claimed"** (Verified) badge appears.
    *   The **"Claim this Business"** button is removed.
    *   The business is **NOT removed** from the site; it simply changes ownership status.

## Summary Table

| Action | Technical Step | Outcome |
| :--- | :--- | :--- |
| **User Claims** | `POST /api/claims/save` | Record in `claim_businesses` (pending), HubSpot Task created. |
| **Admin Notification**| HubSpot Task | Admin sees "business_claim_leads" task in HubSpot. |
| **Admin Approval** | Manual DB Update | Admin sets `claimed_approval = true` manually. |
| **User Notification** | None (Code-wise) | Admin must manually email/call user. |
| **Site Update** | Immediate upon DB update | "Claimed" badge appears; "Unclaimed" badge removed. |
