# Blowtech Banking App Guidelines

## Purpose

Blowtech Banking is a mobile-first banking experience designed to make everyday financial tasks clear, fast, accessible, and secure.

The product should help users:

- Check balances
- Review spending
- Send money
- Pay bills
- Add money
- Search transactions
- Manage security
- Contact support

## Design Principles

### 1. Clarity First

Use simple language and make important information easy to scan.

Prefer:

- `Send money`
- `Available balance`
- `Payment sent`
- `Review security`

Avoid:

- Complex financial terminology
- Unclear abbreviations
- Technical error messages
- Hidden actions

### 2. One Primary Action

Each screen or modal should have one clear primary action.

Examples:

- Balance screen: `View activity`
- Transfer form: `Continue`
- Confirmation screen: `Send payment`
- Success screen: `Done`

Secondary actions should be visually quieter.

### 3. Build Trust

The interface should feel safe and predictable.

Use:

- Clear confirmation messages
- Masked account information
- Visible transaction references
- Security status indicators
- Login and payment alerts
- Reassuring but honest language

Never exaggerate security claims or imply that the prototype is a production banking system.

### 4. Reduce Friction

Banking tasks should require as few steps as possible while still providing appropriate security.

Users should be able to:

- Find their balance immediately
- Start a transfer quickly
- Understand what will happen before confirming
- Recover from validation errors easily
- Return to the previous screen without losing input

## Visual Guidelines

### Color Palette

Use a restrained fintech palette:

- Background: soft off-white
- Primary text: deep navy
- Secondary text: muted slate
- Primary action: accessible blue
- Positive state: mint or green
- Warning state: amber
- Error state: red
- Cards: white
- Borders: light blue-gray

Do not use color as the only method of communicating status.

### Typography

- Use one clean sans-serif font family
- Use readable sizes on mobile
- Maintain strong contrast between headings and body text
- Use sentence case for labels
- Avoid unnecessary all-caps text
- Use short, readable paragraphs

Recommended hierarchy:

- Page heading: large and bold
- Section heading: medium and semibold
- Card title: small and bold
- Body copy: readable regular text
- Helper text: smaller muted text

### Spacing

Use a consistent spacing scale.

- Small spacing: 8px
- Medium spacing: 16px
- Large spacing: 24px
- Section spacing: 32px to 48px

Prefer flexbox and grid layouts. Avoid unnecessary absolute positioning.

### Cards

Cards should:

- Group related information
- Have clear headings
- Use subtle borders
- Use rounded corners consistently
- Avoid excessive shadows
- Maintain enough internal padding

Do not place too many cards next to each other on small screens.

### Icons

- Use a consistent line-icon library
- Use icons with accessible labels when they are interactive
- Do not use emoji as interface icons
- Do not use icons without context when the action may be ambiguous
- Keep icon size consistent
- Pair unfamiliar icons with text labels

## Responsive Guidelines

### Mobile

At mobile widths:

- Use a single-column layout
- Keep touch targets at least 44px
- Use a bottom navigation bar
- Stack cards vertically
- Allow modals to use most of the screen
- Keep important actions visible
- Prevent horizontal scrolling
- Avoid dense transaction rows

### Tablet

At tablet widths:

- Use a two-column layout where appropriate
- Keep navigation compact
- Preserve readable card widths
- Avoid stretching content excessively

### Desktop

At desktop widths:

- Use a centered workspace
- Use a left navigation rail
- Keep the main content readable
- Use whitespace to separate sections
- Avoid overly wide transaction tables

## Navigation Guidelines

Navigation should be consistent across the application.

Primary destinations:

- Home
- Payments
- Activity
- More

Navigation requirements:

- Clearly show the current location
- Use both icons and text where possible
- Keep navigation order consistent
- Ensure all navigation controls are keyboard accessible
- Do not hide essential features behind multiple menus

## Interaction Guidelines

### Buttons

Every visible button must:

- Have a clear accessible name
- Perform a useful action
- Provide hover and focus states
- Provide a disabled state where necessary
- Prevent duplicate submissions
- Use the correct button type

Use action-oriented labels:

- `Send payment`
- `Continue`
- `Review settings`
- `View activity`
- `Message support`

Avoid vague labels:

- `Click here`
- `Submit`
- `More`
- `Continue` when the next step is unclear

### Modals

Modals must:

- Have a clear title
- Include a close button
- Be dismissible with Escape
- Keep focus inside the modal while open
- Return focus to the triggering element after closing
- Prevent background content from being confusingly interactive
- Work on small screens
- Include clear primary and secondary actions

### Forms

Forms must:

- Use visible labels
- Show required fields clearly
- Validate input before submission
- Provide inline error messages
- Preserve valid input after an error
- Use `aria-invalid` for invalid controls
- Associate errors with their fields
- Validate amounts as positive numbers
- Prevent duplicate submissions

## Send Money Guidelines

The send-money flow should have three states:

### 1. Form

Fields:

- Recipient
- Amount
- Optional note

### 2. Confirmation

Show:

- Recipient
- Amount
- Note
- Payment action

### 3. Success

Show:

- Payment sent message
- Recipient
- Amount
- Transaction reference
- Completion action

The user must always understand:

- Who will receive the money
- How much will be sent
- Whether the payment was completed
- What to do next

## Transaction Guidelines

Transaction rows should show:

- Merchant or recipient
- Category
- Date
- Amount
- Positive or negative sign

Transaction search should:

- Update results clearly
- Support partial text matches
- Provide an empty state
- Not erase the full transaction list permanently
- Include a clear way to reset the search

Example empty state:

> No transactions match your search. Try another merchant, category, or date.

## Accessibility Guidelines

Follow WCAG 2.2 AA principles.

### Semantic Structure

Use:

- `header`
- `nav`
- `main`
- `section`
- `article`
- `button`
- `form`
- Proper heading levels

### Keyboard Access

All interactive elements must be usable with:

- Tab
- Shift + Tab
- Enter
- Space
- Escape for dialogs

Do not create clickable `div` elements when a button or link is appropriate.

### Focus

- Always provide visible focus states
- Do not remove browser focus outlines without replacing them
- Manage focus correctly inside dialogs
- Return focus after closing overlays

### Color Contrast

- Use sufficient contrast for text
- Check muted text carefully
- Do not rely on color alone
- Pair status colors with labels, icons, or signs

### Touch Targets

Interactive controls should be at least 44px by 44px.

This includes:

- Buttons
- Navigation items
- Close controls
- Icon buttons
- Toggles

### Screen Readers

- Add accessible names to icon-only controls
- Use `aria-label` only when visible text is not available
- Associate form labels and descriptions correctly
- Announce important success and error messages
- Use meaningful alt text for non-decorative images

### Motion

- Keep motion subtle and purposeful
- Respect `prefers-reduced-motion`
- Avoid flashing or rapidly moving content
- Do not use animation to communicate critical information alone

## Security Guidelines

This project is a prototype, but the interface should model secure banking behavior.

### Sensitive Information

- Mask account numbers
- Never show complete account credentials
- Do not place sensitive information in URLs
- Do not log sensitive information
- Do not expose secrets in client-side code

### Payments

- Validate all payment inputs
- Require confirmation before sending
- Disable the submit action while processing
- Prevent duplicate submissions
- Display a transaction reference after success
- In production, validate payment details again on the server

### Authentication

If authentication is added later:

- Use secure session management
- Use password hashing
- Use secure cookies
- Support account recovery
- Add login alerts
- Support biometric authentication where appropriate
- Protect authenticated routes

### Security Communication

Security copy should be clear and honest.

Good example:

> Login alerts are enabled for this account.

Avoid:

> Your account is completely impossible to hack.

## Error Handling Guidelines

Errors should be:

- Specific
- Calm
- Actionable
- Written in plain language
- Displayed near the relevant control

Good example:

> Enter an amount greater than $0.

Bad example:

> Invalid input.

For system errors:

> We could not complete that payment. Your money was not sent. Please try again.

## Empty and Loading States

Every data-driven section should account for:

- Loading
- Empty
- Error
- Success

Loading states should use accessible skeletons or progress indicators.

Empty states should explain:

- What is empty
- Why it may be empty
- What the user can do next

## Content Guidelines

Use a friendly, professional tone.

Content should be:

- Concise
- Reassuring
- Direct
- Respectful
- Non-judgmental

Avoid:

- Blame
- Fear-based language
- Jargon
- Excessive exclamation marks
- Unnecessary technical details

Example tone:

> Your payment is ready to review.

> We could not find any matching transactions.

> Your security settings are up to date.

## Component Guidelines

Use reusable components instead of repeating markup.

Recommended components:

- `BankingApp`
- `DashboardHeader`
- `BalanceCard`
- `SpendingSummary`
- `QuickActions`
- `TransactionList`
- `TransactionRow`
- `SendMoneyModal`
- `SecurityCenter`
- `SupportCard`
- `ResearchCard`
- `MobileBottomNav`

Components should:

- Have clear responsibilities
- Accept props for dynamic content
- Avoid unnecessary duplication
- Keep interaction logic close to the relevant UI
- Use accessible HTML
- Avoid excessively large files

## Technical Guidelines

Use:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons

Code should:

- Use clear names
- Prefer reusable components
- Avoid unnecessary state
- Avoid fetching inside `useEffect`
- Avoid `localStorage` for persistence
- Avoid hardcoded secrets
- Keep client components limited to interactive sections
- Preserve existing comments that explain important behavior

## Quality Checklist

Before considering the feature complete, confirm:

- The layout works on mobile
- The layout works on desktop
- No horizontal overflow exists
- All buttons work
- The balance toggle works
- Transaction search works
- The send-money modal works
- Form validation works
- Payment confirmation works
- Payment success state works
- Security settings open correctly
- Support actions provide feedback
- Modals can close with Escape
- Keyboard navigation works
- Focus states are visible
- Sensitive information is masked
- Empty states are included
- Error states are understandable
- Metadata is updated
- Production build succeeds
- No console errors remain

## Definition of Done

The Blowtech Banking app is complete when it provides a polished, responsive, accessible, and interactive banking prototype that clearly demonstrates:

- User-centered design
- Target user understanding
- Persona-based decisions
- Usability planning
- Accessibility compliance
- Security awareness
- Functional interface interactions
- Responsive behavior across mobile and desktop