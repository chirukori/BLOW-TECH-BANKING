# Blowtech Mobile Banking App

## Project Overview

Build a polished, responsive, mobile-first banking application called **Blowtech Banking**.

The app should provide a calm, trustworthy, accessible, and secure digital banking experience for Blowtech users. It should work as both a functional prototype and a product case study demonstrating user research, personas, usability requirements, accessibility considerations, and security requirements.

## Product Goal

Help users:

- View their balance quickly
- Understand their recent spending
- Send money with minimal friction
- Pay bills
- Add money
- Search transaction history
- Review their security settings
- Contact customer support

The interface should feel simple, human, and trustworthy rather than overwhelming or overly technical.

## Target Users

### 1. Busy Blowtech Employees

- Need to check balances quickly between work activities
- Want fast transfers and payment confirmations
- Prefer clear information and minimal steps

### 2. First-Time Digital Banking Users

- Need simple guidance and plain-language explanations
- May be confused by banking terminology
- Need visible confirmation after important actions

### 3. Independent Earners and Contractors

- Need to track income, bills, and spending
- Want searchable and understandable transaction activity
- Need clear separation between incoming and outgoing money

## User Personas

### Persona 1: Alex Morgan

- Role: Blowtech product designer
- Goal: Check balance and send money quickly
- Pain point: Too many steps and unclear payment confirmations
- Accessibility need: Strong contrast, clear hierarchy, and predictable navigation

### Persona 2: Priya Shah

- Role: First-time digital banking user
- Goal: Understand spending and recurring bills
- Pain point: Confusing financial terminology
- Accessibility need: Plain language, readable text, and large touch targets

### Persona 3: Jordan Lee

- Role: Independent contractor
- Goal: Separate income, bills, and savings
- Pain point: Difficult transaction categorization
- Accessibility need: Searchable activity and consistent navigation

## Main App Layout

### Desktop Layout

- Centered banking workspace
- Left navigation rail
- Main dashboard content
- Top header with:
  - Blowtech logo
  - Search button
  - Notification button
  - User avatar with initials `AM`

### Mobile Layout

- Full-width responsive layout
- Compact top header
- Bottom navigation with:
  - Home
  - Payments
  - Activity
  - More

## Visual Design Direction

Use a modern fintech visual style:

- Calm
- Trustworthy
- Human
- Premium
- Accessible
- Minimal but not empty

### Colors

Use a soft neutral background with:

- Navy for primary text
- Muted blue for actions and links
- Mint green for positive financial states
- Soft red or amber for warnings
- White cards with subtle borders

Avoid excessive gradients, neon colors, and visual clutter.

### UI Styling

- Rounded cards
- Subtle borders
- Soft shadows only where needed
- Generous spacing
- Clear section hierarchy
- Mobile-first responsive design
- No emoji icons
- Use clean line icons such as Lucide icons

## Dashboard Requirements

Create a dashboard with the following content:

### Greeting

- Heading: `Good morning, Alex`
- Supporting text: `Here’s your money snapshot.`

### Balance Card

Display:

- Label: `Total balance`
- Amount: `$12,480.50`
- Account name: `Everyday account`
- Account number: `•••• 4821`
- Status: `Available now`
- A show/hide balance toggle

The balance toggle must work and should hide sensitive information when disabled.

### Spending Summary

Display:

- This month spending: `$2,146.24`
- Comparison: `8.4% less than last month`
- A small visual spending indicator or progress bar

### Quick Actions

Create interactive buttons for:

- Send money
- Pay a bill
- Add money
- View all

Every button must perform an action, open a modal, or display feedback.

## Recent Activity

Add a section titled `Recent activity`.

Each transaction should include:

- Merchant or recipient
- Category
- Date
- Amount
- Positive or negative visual state

Use these example transactions:

1. Northstar Market
   - Category: Groceries
   - Date: Today
   - Amount: `-$84.20`

2. Salary deposit
   - Category: Income
   - Date: Yesterday
   - Amount: `+$4,200.00`

3. Brightline Electric
   - Category: Bills
   - Date: Sep 12
   - Amount: `-$112.40`

4. Coffee Lab
   - Category: Food & drink
   - Date: Sep 11
   - Amount: `-$6.80`

Add:

- Search input
- Real-time transaction filtering
- `See all activity` button
- Empty state when no transactions match

Do not rely on color alone to communicate positive or negative status. Include signs and clear labels.

## Send Money Flow

Clicking `Send money` must open an accessible modal.

### Step 1: Payment Form

Include:

- Recipient input
- Amount input
- Optional note input
- Continue button
- Cancel or close button

### Validation

- Recipient is required
- Amount is required
- Amount must be positive
- Display clear inline validation messages
- Use accessible labels
- Use `aria-invalid` when fields are invalid

### Step 2: Confirmation

Show:

- Recipient
- Amount
- Optional note
- `Send payment` button
- Back button

### Step 3: Success State

After submission, display:

- Heading: `Payment sent`
- Recipient name
- Amount sent
- Transaction reference
- Close button

Prevent duplicate submissions and provide clear feedback.

## Security Center

Add a security card or modal containing:

- `Security is on`
- `Last checked just now`
- Biometric sign-in status
- Login alerts enabled
- Device management
- Masked account information
- `Review settings` action

Use reassuring language such as:

> Your account is protected with secure sign-in and real-time activity alerts.

Never expose complete account numbers or sensitive personal information.

## Support

Add a support section titled:

`Need a hand?`

Include:

- Message support
- Help center
- Report a problem

Each option should open a useful modal, drawer, or feedback state.

## Product Research Section

Add a visible section titled:

`Built around real banking friction`

Include these research cards.

### Target Users

Busy Blowtech employees, first-time digital banking users, and independent earners who need clarity between paydays.

### User Difficulties

Users struggle to locate balances quickly, understand pending payments, confirm transfers, recover account access, and find security settings.

### Usability

Use plain-language labels, one clear primary action per screen, predictable navigation, visible confirmations, and forgiving transaction search.

### Accessibility and Security

Use keyboard-ready controls, high contrast, large tap targets, reduced visual noise, biometric sign-in, masked information, and real-time security alerts.

## Usability Requirements

- Use plain-language labels
- Keep one primary action per screen
- Provide confirmation after important actions
- Keep navigation consistent
- Use predictable modal behavior
- Make search easy to access
- Give every button a clear label
- Never rely on color alone
- Include loading, empty, error, and success states
- Preserve user input when validation fails
- Make the interface easy to understand without prior banking knowledge

## Accessibility Requirements

Follow WCAG 2.2 AA principles.

- Use semantic HTML
- Use headings in logical order
- Add labels to all form controls
- Support keyboard navigation
- Provide visible focus states
- Maintain sufficient color contrast
- Use touch targets of at least 44px
- Support screen readers
- Use descriptive accessible names
- Allow modals to close with Escape
- Trap focus inside open modals
- Respect reduced-motion preferences
- Avoid flashing content
- Use readable font sizes
- Do not communicate meaning through color alone

## Security Requirements

- Mask account numbers
- Do not expose sensitive information in URLs
- Validate and sanitize all form inputs
- Prevent duplicate payment submissions
- Show secure confirmation steps
- Display transaction references after successful payments
- Support biometric sign-in as a visual state
- Provide login and payment alerts
- Keep sensitive data out of client-side logs
- Use secure response headers in production
- Use proper authentication if real backend functionality is added
- Recalculate and validate payment data on the server in production

## Technical Requirements

Use:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Lucide icons

Use reusable components such as:

- `BankingApp`
- `DashboardHeader`
- `BalanceCard`
- `QuickActions`
- `TransactionList`
- `SendMoneyModal`
- `SecurityCenter`
- `SupportCard`
- `ResearchCard`
- `MobileBottomNav`

Use client components only for interactive features such as:

- Balance visibility
- Modal state
- Form state
- Transaction filtering
- Toast or confirmation messages

Do not use:

- Emoji icons
- Hardcoded inaccessible controls
- Huge single-file components
- LocalStorage for persistence
- Fake authentication
- Broken or decorative buttons
- Sensitive data displayed in full

Demo data may be used for this prototype. If real persistence is later required, connect the app to a proper database and authentication system.

## Metadata

Set the page metadata to:

- Title: `Blowtech — Digital banking that feels human`
- Description: `A calm, accessible mobile banking experience for Blowtech users.`

## Responsive Requirements

The app must work at:

- Mobile: 375px width
- Tablet: 768px width
- Desktop: 1280px width

Check that:

- Cards do not overflow
- Text remains readable
- Buttons remain tappable
- Modals fit on small screens
- Navigation adapts correctly
- Transaction rows remain understandable
- The mobile bottom navigation remains visible and usable

## Validation Checklist

Before completing the implementation:

- Run a production build
- Test the mobile layout
- Test the desktop layout
- Test the balance visibility toggle
- Test transaction search
- Test the send-money modal
- Test form validation
- Test confirmation and success states
- Test the security modal
- Test support actions
- Check keyboard navigation
- Check modal Escape behavior
- Check for console errors
- Check for broken buttons
- Check for layout overflow
- Ensure all important UI controls are accessible

## Final Quality Standard

The completed app should feel like a real Blowtech banking product prototype and product design case study.

It must communicate:

- Trust
- Clarity
- Accessibility
- Security
- Simplicity
- Human-centered design

Every visible button must work, open a meaningful interaction, filter content, or provide clear user feedback.