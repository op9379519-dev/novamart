# Project Instructions and Guidelines

## Language Preference
- **Always communicate strictly in English.** Do not use any other language or mixed dialects for responses.

## Authentication and Session Persistence Rules
- **Session-Based Logins:** To guarantee secure access, the customer's login state (`currentUser` and `isAdminAuthenticated`) must be stored using `sessionStorage` instead of `localStorage`.
- **Automatic Logout:** When the user closes the website tab/window, they must be automatically logged out.
- **Redirection after Login:** Upon a successful login, the application must immediately redirect the user to the Marketplace ("catalog" view) so they can start browsing products.
