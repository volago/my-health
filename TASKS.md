# MyHealth Application Implementation

Tasks related to the development of the MyHealth application.

## Completed Tasks

- [x] Setup basic Firebase Authentication (Login/Registration) - *Zakładam, że to było zrobione wcześniej*
- [x] Create `ToolbarComponent` (`apps/my-health/src/app/shared/ui/toolbar/`)
- [x] Implement HTML structure for `ToolbarComponent` with navigation links (Dashboard, Katalog badań, Raporty AI) and user menu (logout)
- [x] Implement basic logic for `ToolbarComponent` (toggle Sidenav, placeholder logout)
- [x] Create `EmptyComponent` as a placeholder for new routes
- [x] Integrate `ToolbarComponent` into `AppComponent`
- [x] Implement Sidenav (`<mat-sidenav>`) in `AppComponent` for mobile navigation
- [x] Define routes for `/dashboard` and `/ai-reports` using `EmptyComponent` and `AuthGuard`

## In Progress Tasks

- [ ] Implement full logout functionality in `ToolbarComponent` (requires `AuthService` integration)
- [ ] Style `ToolbarComponent` and Sidenav using Tailwind CSS for responsiveness and appearance
- [ ] Display user information (e.g., name/email) in the toolbar user menu

## Future Tasks

- [ ] Implement "Dashboard" feature
- [ ] Implement "Katalog badań" feature (connecting to `@my-health/features/catalog`)
- [ ] Implement "Raporty AI" feature
- [ ] Add user profile page accessible from user menu
- [ ] Implement detailed error handling and user feedback for all operations

## Implementation Plan

### Toolbar & Navigation

The application features a main toolbar and a side navigation drawer for mobile devices.

-   **Toolbar (`ToolbarComponent`):**
    -   Located at `apps/my-health/src/app/shared/ui/toolbar/toolbar.component.ts`.
    -   Displays primary navigation links: Dashboard, Katalog badań, Raporty AI.
    -   Includes a user icon with a dropdown menu for actions like "Logout".
    -   On mobile, a hamburger icon toggles the Sidenav.
    -   Uses Angular Material components (`MatToolbar`, `MatIcon`, `MatButton`, `MatMenu`).
-   **Sidenav (`AppComponent`):**
    -   Defined in `apps/my-health/src/app/app.component.html`.
    -   Provides navigation links for mobile users.
    -   Uses Angular Material components (`MatSidenavContainer`, `MatSidenav`, `MatNavList`).
-   **Routing (`app.routes.ts`):**
    -   Main routes (`/dashboard`, `/catalog`, `/ai-reports`) are protected by `AuthGuard`.
    -   `/auth` handles authentication routes.

### Relevant Files

-   `apps/my-health/src/app/app.component.ts` - Main app component, hosts Sidenav and Toolbar.
-   `apps/my-health/src/app/app.component.html` - Main app template with Sidenav structure.
-   `apps/my-health/src/app/shared/ui/toolbar/toolbar.component.ts` - Logic for the toolbar. ✅
-   `apps/my-health/src/app/shared/ui/toolbar/toolbar.component.html` - Template for the toolbar. ✅
-   `apps/my-health/src/app/shared/ui/toolbar/toolbar.component.scss` - Styles for the toolbar. ✅
-   `apps/my-health/src/app/shared/ui/empty/empty.component.ts` - Placeholder for future components. ✅
-   `apps/my-health/src/app/app.routes.ts` - Application routes definition. ✅ 