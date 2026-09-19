"""
Generate SomaLibrary_Project_Plan.docx — accurate to the real codebase.
"""
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

OUT = "SomaLibrary_Project_Plan.docx"

# ── helpers ──────────────────────────────────────────────────────────────

def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:fill'), fill)
    tc_pr.append(shd)

def cell_margin(cell, top=90, start=110, bottom=90, end=110):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    mar = tc_pr.first_child_found_in('w:tcMar')
    if mar is None:
        mar = OxmlElement('w:tcMar')
        tc_pr.append(mar)
    for side, value in [('top', top), ('start', start), ('bottom', bottom), ('end', end)]:
        node = mar.find(qn(f'w:{side}'))
        if node is None:
            node = OxmlElement(f'w:{side}')
            mar.append(node)
        node.set(qn(f'w:w'), str(value))
        node.set(qn('w:type'), 'dxa')

def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement('w:tblHeader')
    tbl_header.set(qn('w:val'), 'true')
    tr_pr.append(tbl_header)

def set_cell_text(cell, text, bold=False, color='101828', size=9.5):
    cell.text = ''
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run(text)
    run.bold = bold
    run.font.name = 'Aptos'
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    cell_margin(cell)

def add_heading(doc, text, level=1):
    p = doc.add_paragraph(style=f'Heading {level}')
    p.paragraph_format.space_before = Pt(13 if level == 1 else 8)
    p.paragraph_format.space_after = Pt(5)
    r = p.add_run(text)
    r.font.color.rgb = RGBColor(0, 0, 0)
    return p

def add_bullets(doc, values):
    for value in values:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.add_run(value)

# ── document setup ───────────────────────────────────────────────────────

doc = Document()
section = doc.sections[0]
section.top_margin = Inches(0.65)
section.bottom_margin = Inches(0.65)
section.left_margin = Inches(0.75)
section.right_margin = Inches(0.75)

styles = doc.styles
styles['Normal'].font.name = 'Aptos'
styles['Normal'].font.size = Pt(10.5)
styles['Normal'].font.color.rgb = RGBColor.from_string('243B53')
styles['Normal'].paragraph_format.space_after = Pt(6)
styles['Normal'].paragraph_format.line_spacing = 1.12
for name, size in [('Heading 1', 15), ('Heading 2', 12)]:
    styles[name].font.name = 'Aptos Display'
    styles[name].font.size = Pt(size)
    styles[name].font.bold = True
    styles[name].font.color.rgb = RGBColor(0, 0, 0)

# ── title block ─────────────────────────────────────────────────────────

p = doc.add_paragraph(style='Title')
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('SomaLibrary Project Plan')
r.font.name = 'Aptos Display'
r.font.size = Pt(25)
r.font.bold = True
r.font.color.rgb = RGBColor(0, 0, 0)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('Digital Library & PDF Book Store for Somalia')
r.font.name = 'Aptos'
r.font.size = Pt(12)
r.font.color.rgb = RGBColor.from_string('52667A')

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('Team project paper  |  September 2026  |  Version 0.1.0')
r.font.name = 'Aptos'
r.font.size = Pt(9.5)
r.font.color.rgb = RGBColor.from_string('52667A')

# ── 1. Project Summary ──────────────────────────────────────────────────

add_heading(doc, 'Project Summary')
doc.add_paragraph(
    'SomaLibrary is a bilingual Somali and English digital platform that gives readers in '
    'Somalia and the diaspora access to a subscription library and a PDF book store from '
    'a phone or computer. There is no physical shipping, no returns, and no printed inventory. '
    'Readers pay once for a book and keep the PDF forever, or pay a monthly subscription to '
    'read from the library. The project also includes an admin panel for managing books, users, '
    'subscriptions, payments, reports, and audit logs.'
)
doc.add_paragraph(
    'The team has four members. The project lead owns the planning, design system, and the '
    'frontend stream, which is split as 85 percent main ownership and 15 percent frontend '
    'support. The remaining two members own the backend, database, API, and deployment stream. '
    'Both streams meet through agreed interfaces so the product can be integrated and released.'
)

# ── 2. Product Overview ─────────────────────────────────────────────────

add_heading(doc, 'Product Overview')
doc.add_paragraph(
    'SomaLibrary combines two separate systems in one product:'
)
add_bullets(doc, [
    'A subscription library. Readers pay a monthly fee to read selected books. Access ends '
    'when the subscription expires. Plans are Basic at $3, Standard at $5, and Premium at $8 '
    'per month. Standard is marked "Most Popular."',
    'A PDF book store. Readers buy individual books once and keep them permanently in My Books. '
    'Books can appear in the library, the store, or both.',
    'A private PDF reader. PDFs are never public. The backend authorizes every read request, and '
    'each page can carry a per-user watermark for protection.',
    'A bilingual interface. The whole user experience is switchable between Somali and English from '
    'a single pill control, with full translation strings for both languages.',
    'An admin dashboard. Staff manage books, users, subscriptions, payments, reports, and audit logs '
    'from a desktop-oriented panel with a sidebar and data tables.',
])

# ── 3. Target Audience ──────────────────────────────────────────────────

add_heading(doc, 'Target Audience')
table = doc.add_table(rows=1, cols=3)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.style = 'Table Grid'
headers = ['Audience', 'Need', 'How SomaLibrary Helps']
for i, text in enumerate(headers):
    set_cell_text(table.rows[0].cells[i], text, True, 'FFFFFF', 9.5)
    shade(table.rows[0].cells[i], '134E4A')
set_repeat_table_header(table.rows[0])
audiences = [
    ('Somali students',
     'Affordable learning material and easy access to books in Somali or English.',
     'Library subscriptions, bilingual search, Somali-language books, and mobile reading.'),
    ('Young professionals',
     'Self development, technology, and business books at a price they can afford.',
     'Curated categories, permanent purchase options, and a clear subscription tier system.'),
    ('Somali families and diaspora',
     'Access to Somali language literature from anywhere, without waiting for physical books.',
     'Bilingual interface, digital delivery, and permanent ownership of purchased PDFs.'),
    ('Writers and local publishers',
     'A digital channel to reach Somali readers and protect their content.',
     'Private PDF storage, admin tools for publishing, and future publisher-facing features.'),
    ('Admin and operations staff',
     'A reliable place to manage books, users, payments, and platform activity.',
     'Dashboards, data tables, audit logs, and role-based access controls.'),
]
for idx, row in enumerate(audiences):
    cells = table.add_row().cells
    fill = 'F2F8F7' if idx % 2 == 0 else 'FFFFFF'
    for i, text in enumerate(row):
        set_cell_text(cells[i], text)
        shade(cells[i], fill)

# ── 4. Project Objectives ───────────────────────────────────────────────

add_heading(doc, 'Project Objectives')
add_bullets(doc, [
    'Provide a calm, simple, mobile-first reading experience for Somali and English readers.',
    'Keep the subscription library and the PDF store as clearly separate systems with separate access rules.',
    'Support Somali payment methods such as EVC Plus and ZAAD, alongside bank cards, through a secure payment workflow.',
    'Give administrators a controlled panel to manage books, users, subscriptions, payments, reports, and audit logs.',
    'Protect digital books through authenticated access, private PDF storage, and per-user watermarks.',
    'Deliver the UI in two languages from one codebase so the product can grow with its audience.',
])

# ── 5. Screens and Feature Scope ────────────────────────────────────────

add_heading(doc, 'Screens and Feature Scope')
doc.add_paragraph(
    'The frontend contains 24 screens in total: 15 user app screens and 9 admin screens. '
    'The user app is mobile-first with a bottom navigation bar, a desktop header, and shared '
    'layouts. The admin panel is desktop-oriented with a sidebar and data tables.'
)

add_heading(doc, '5.1  User App Screens (15)', level=2)
user_table = doc.add_table(rows=1, cols=3)
user_table.alignment = WD_TABLE_ALIGNMENT.CENTER
user_table.style = 'Table Grid'
for i, text in enumerate(['Screen', 'Purpose', 'Key Elements']):
    set_cell_text(user_table.rows[0].cells[i], text, True, 'FFFFFF', 9)
    shade(user_table.rows[0].cells[i], '134E4A')
set_repeat_table_header(user_table.rows[0])
user_screens = [
    ('Home',
     'First impression and discovery',
     'Hero with search, continue reading card, new books grid, category chips, bottom navigation.'),
    ('Library',
     'Subscription reading list',
     'Active subscription banner, search, filter chips, book grid with library badge, expiry warning.'),
    ('Store',
     'Buy individual PDF books',
     'Search, filter chips, promo card, book grid with prices, cart icon with badge.'),
    ('Book Details',
     'Read about one book',
     'Cover, meta chips, rating, description, library and store info cards, sticky Read / Buy actions.'),
    ('Cart',
     'Review books before payment',
     'Cart items, remove actions, digital note, totals card, secure checkout button.'),
    ('Checkout',
     'Choose payment method and pay',
     'Order summary, EVC Plus / ZAAD / Card options, totals, pay button.'),
    ('Payment Result',
     'Show success or failure after payment',
     'Signed circle icon, headline, receipt card with plan or amount, reference, method, actions.'),
    ('My Books',
     'Books the reader owns or borrows',
     'Purchased / Subscription tabs, book grid, expiry and "purchased on" labels, renew link.'),
    ('PDF Reader',
     'Read a book page by page',
     'Full-bleed reading view, page slider, top and bottom controls, per-user watermark line.'),
    ('Subscription Plans',
     'Choose a library plan',
     'Three plan cards, feature lists in the active language, payment method mini-select, sticky choose button.'),
    ('Login',
     'Sign in to an existing account',
     'Email and password fields, remember me, forgot password, social login row, register link.'),
    ('Register',
     'Create a new account',
     'Full name, email, Somalia phone with +252 prefix, password with hint, terms checkbox.'),
    ('Profile',
     'Account and subscription status',
     'User card, active plan card with expiry bar, menu links, admin shortcut, logout.'),
    ('Search',
     'Search and sort books',
     'Search input, sort chips, filter chips, results list, empty state.'),
    ('Notifications',
     'Subscription and payment updates',
     'Grouped list by today and earlier, colored icons, mark all read, action links.'),
]
for idx, row in enumerate(user_screens):
    cells = user_table.add_row().cells
    fill = 'F2F8F7' if idx % 2 == 0 else 'FFFFFF'
    for i, text in enumerate(row):
        set_cell_text(cells[i], text, size=8.5)
        shade(cells[i], fill)

add_heading(doc, '5.2  Admin Screens (9)', level=2)
admin_table = doc.add_table(rows=1, cols=3)
admin_table.alignment = WD_TABLE_ALIGNMENT.CENTER
admin_table.style = 'Table Grid'
for i, text in enumerate(['Screen', 'Purpose', 'Key Elements']):
    set_cell_text(admin_table.rows[0].cells[i], text, True, 'FFFFFF', 9)
    shade(admin_table.rows[0].cells[i], '134E4A')
set_repeat_table_header(admin_table.rows[0])
admin_screens = [
    ('Admin Dashboard',
     'Platform overview for staff',
     'KPI cards, revenue chart, popular books table, recent payments table, latest activity preview.'),
    ('Manage Books',
     'List, search, and manage books',
     'Search, category and language filters, tab filters, data table with covers and status pills, bulk actions.'),
    ('Add / Edit Book',
     'Create or update a book record',
     'Book info fields, description editor, PDF and cover upload dropzones, library and store toggles, store price, preview panel.'),
    ('Manage Users',
     'View and manage reader accounts',
     'Search, role and status filters, user table, detail drawer with subscription timeline and recent payments, suspend action.'),
    ('Manage Subscriptions',
     'Manage plans and active subscriptions',
     'Summary strip, plans editor with price and duration, recent subscriptions table with status pills.'),
    ('Payments Admin',
     'Review payment records',
     'Payments list with search, filters, status pills, and payment detail view.'),
    ('Reports',
     'Business reports for store and library',
     'Tabs for store and library, KPI cards, sales bar chart, category donut, top books and top users tables.'),
    ('Audit Logs',
     'Track admin and system activity',
     'Timestamped log table with action, entity, details, and IP filters.'),
    ('Settings',
     'Configure platform rules and providers',
     'General settings, payment provider toggles, library rules, admin users list, danger zone actions.'),
]
for idx, row in enumerate(admin_screens):
    cells = admin_table.add_row().cells
    fill = 'F2F8F7' if idx % 2 == 0 else 'FFFFFF'
    for i, text in enumerate(row):
        set_cell_text(cells[i], text, size=8.5)
        shade(cells[i], fill)

# ── 6. Target Audience ──────────────────────────────────────────────────

# (already covered above; keep structure flat)

# ── 7. Design Direction ─────────────────────────────────────────────────

add_heading(doc, 'Design Direction')
doc.add_paragraph(
    'The interface uses a Somali flag blue and white theme. The main accent is #4189DE, with '
    '#2B5FA8 for pressed states and #E8F1FB for light highlights. The background is kept very '
    'light at #F7FAFD, cards are white, and text uses dark ink colors for readability. The '
    'visual style is clean and minimal, with soft shadows, 16px rounded corners, outline icons, '
    'and pill-shaped chips. Buttons are large enough for touch, with a minimum height of 44px.'
)
doc.add_paragraph(
    'The user app is designed mobile-first at about 390px width and scales up to desktop. '
    'Books are shown in a 2-column grid on mobile and a wider grid on larger screens. One primary '
    'blue action appears per screen. Empty states, loading states, and language switching are '
    'treated as part of the design, not as afterthoughts. The admin panel uses a left sidebar for '
    'navigation and data tables with status pills for clear operational review.'
)

# ── 8. Tech Stack ───────────────────────────────────────────────────────

add_heading(doc, 'Tech Stack')
stack_table = doc.add_table(rows=1, cols=2)
stack_table.alignment = WD_TABLE_ALIGNMENT.CENTER
stack_table.style = 'Table Grid'
for i, text in enumerate(['Layer', 'Technologies']):
    set_cell_text(stack_table.rows[0].cells[i], text, True, 'FFFFFF', 9.5)
    shade(stack_table.rows[0].cells[i], '134E4A')
set_repeat_table_header(stack_table.rows[0])
stack_rows = [
    ('Frontend',
     'React 18, TypeScript 5.6, Tailwind CSS 3.4, Vite 5.4, React Router v6, PostCSS, Autoprefixer, '
     'React context-based state, mock data layer ready for backend replacement.'),
    ('Backend',
     'Node.js with Express 4.21, TypeScript 5.6, MySQL via mysql2 3.11, bcryptjs 2.4 for passwords, '
     'jsonwebtoken 9.0 for sessions, Zod 3.24 for validation, express-rate-limit 7.4, helmet 8.0, cors 2.8, dotenv 16.4.'),
    ('Database',
     'MySQL with a planned schema for users, books, subscriptions, purchases, payments, reading history, '
     'notifications, and audit logs.'),
    ('Auth and security',
     'JWT-based authentication, bcrypt password hashing, role-based access with reader and admin roles, '
     'private PDF access controlled by the backend.'),
    ('Payments',
     'Modular payment design supporting EVC Plus, ZAAD Service, and bank cards, with payment records, '
     'status tracking, and verified access grants.'),
    ('Content protection',
     'PDFs stored privately, accessed only through authorized backend flows, with per-user watermark support '
     'in the reader.'),
    ('Localization',
     'Full Somali and English translation files, language switch component, and language-aware UI strings.'),
]
for idx, row in enumerate(stack_rows):
    cells = stack_table.add_row().cells
    fill = 'F2F8F7' if idx % 2 == 0 else 'FFFFFF'
    for i, text in enumerate(row):
        set_cell_text(cells[i], text, size=9)
        shade(cells[i], fill)

# ── 9. Team Roles and Work Split ────────────────────────────────────────

add_heading(doc, 'Team Roles and Work Split')
doc.add_paragraph(
    'The project has four members. The work is divided into two connected streams: a frontend stream '
    'led by the project owner, and a backend and operations stream owned by two teammates. '
    'The frontend support role is a smaller share within the frontend stream.'
)

roles = doc.add_table(rows=1, cols=4)
roles.alignment = WD_TABLE_ALIGNMENT.CENTER
roles.style = 'Table Grid'
for i, text in enumerate(['Team Member', 'Share', 'Main Responsibilities', 'Deliverables']):
    set_cell_text(roles.rows[0].cells[i], text, True, 'FFFFFF', 9)
    shade(roles.rows[0].cells[i], '134E4A')
set_repeat_table_header(roles.rows[0])
role_rows = [
    (
        'You — Project Lead',
        '85 percent of the frontend stream',
        'Project planning, requirements, user journeys, design system, bilingual content direction, '
        'overall frontend architecture, shared components, layouts, pages, context and state, i18n, '
        'types, mock data, code review, and final frontend integration.',
        'Project plan, design system and UI direction, all user app and admin pages, shared components, '
        'Tailwind styling, translation review, frontend quality checklist, integration handoff to backend.'
    ),
    (
        'Teammate 1 — Frontend Support',
        '15 percent of the frontend stream',
        'Assigned basic frontend tasks under the project lead review: small reusable components, '
        'content and copy updates, responsive fixes, translation entry, QA checks, and simple page '
        'sections or refinements.',
        'Tested components, corrected copy, mobile and spacing fixes, translation updates, issue list, '
        'and documented handoff notes to the lead.'
    ),
    (
        'Teammate 2 — Backend and API',
        'Backend owner',
        'Express server, routing, authentication with JWT and bcrypt, role checks, API endpoints for '
        'books, users, subscriptions, purchases, payments, and reading access, payment workflow, '
        'PDF authorization, Zod validation, and middleware.',
        'Working API, authentication endpoints, book and user routes, subscription and payment flows, '
        'PDF access control, API documentation, and integration support for the frontend.'
    ),
    (
        'Teammate 3 — Database and Deployment',
        'Data and operations owner',
        'MySQL schema design, migrations, seed data, environment configuration, database backups, '
        'deployment pipeline, production environment, secrets management, monitoring, and release support.',
        'Database schema, migration and seed scripts, deployed environment, secrets configuration, '
        'backup and deployment checklist, and release readiness notes.'
    ),
]
for idx, row in enumerate(role_rows):
    cells = roles.add_row().cells
    fill = 'F2F8F7' if idx % 2 == 0 else 'FFFFFF'
    for i, text in enumerate(row):
        set_cell_text(cells[i], text, size=8.5)
        shade(cells[i], fill)

doc.add_paragraph(
    'The frontend stream and the backend stream are separate but connected. The frontend lead defines '
    'the user interface and expected behavior. The backend owner builds the API and access rules. The '
    'database and deployment owner makes sure the data and environment support both. Integration happens '
    'once both streams have a working development base.'
)

# ── 10. Work Plan and Milestones ────────────────────────────────────────

add_heading(doc, 'Work Plan and Milestones')
doc.add_paragraph(
    'The project moves through five phases. The frontend stream starts early and keeps going through '
    'integration. The backend and database stream starts once the scope is clear and continues through '
    'deployment. The final phase includes both streams.'
)

milestones = doc.add_table(rows=1, cols=4)
milestones.alignment = WD_TABLE_ALIGNMENT.CENTER
milestones.style = 'Table Grid'
for i, text in enumerate(['Phase', 'Main Work', 'Main Owner(s)', 'Output']):
    set_cell_text(milestones.rows[0].cells[i], text, True, 'FFFFFF', 9)
    shade(milestones.rows[0].cells[i], '134E4A')
set_repeat_table_header(milestones.rows[0])
milestone_rows = [
    (
        '1. Planning and design',
        'Confirm requirements, user journeys, design system, color and content direction, roles, '
        'payment flow, access rules, and first release scope.',
        'Project Lead',
        'Approved project plan, design system, and UI direction.'
    ),
    (
        '2. Frontend foundation',
        'Build the app shell, navigation, layouts, shared components, bilingual content, mock data, '
        'and all user and admin screens as a working frontend prototype.',
        'Project Lead with Frontend Support',
        'Usable frontend prototype with all 24 screens and the design system in place.'
    ),
    (
        '3. Data and API foundation',
        'Create the database schema, migrations, and seeds. Build authentication, roles, book and user '
        'routes, subscription and payment flows, and PDF access rules.',
        'Backend Owner and Database Owner',
        'Connected development API and database with authentication and core business rules.'
    ),
    (
        '4. Integration',
        'Replace mock data and mock auth with real API calls. Validate payment and subscription access, '
        'purchase flow, reader access checks, admin flows, and error handling.',
        'All members',
        'End-to-end working beta with real API and database.'
    ),
    (
        '5. Testing and release',
        'Fix defects, test mobile screens, secure environment variables, deploy, back up, document '
        'handover, and confirm support responsibilities.',
        'All members led by Database and Deployment Owner',
        'Production-ready first release with deployment, backup, and handover notes.'
    ),
]
for idx, row in enumerate(milestone_rows):
    cells = milestones.add_row().cells
    fill = 'F2F8F7' if idx % 2 == 0 else 'FFFFFF'
    for i, text in enumerate(row):
        set_cell_text(cells[i], text, size=8.5)
        shade(cells[i], fill)

# ── 11. Quality and Risk Controls ───────────────────────────────────────

add_heading(doc, 'Quality and Risk Controls')
add_bullets(doc, [
    'No PDF link will be public. The backend must check access before a reader can open a book.',
    'A subscription only grants library access. A purchased PDF remains available to the purchaser after purchase.',
    'Payment success must be confirmed by the payment service before a subscription or purchase is activated.',
    'The project lead reviews frontend work and design consistency before features are marked complete.',
    'The deployment owner keeps environment secrets out of the source code and maintains a tested backup process.',
    'The app must stay responsive on mobile and desktop, with clear empty and error states in both languages.',
])

# ── 12. Communication and Review ────────────────────────────────────────

add_heading(doc, 'Communication and Review')
doc.add_paragraph(
    'The team meets once a week for a short planning and review session. Each member shares completed work, '
    'blocked tasks, and next steps. The project lead maintains the priority list and accepts frontend work. '
    'The backend owner and the database owner confirm API and deployment readiness before integration. '
    'Any change that affects payments, access rules, or deployment must be reviewed by the relevant owner '
    'before release.'
)

# ── 13. Success Criteria ────────────────────────────────────────────────

add_heading(doc, 'Success Criteria')
add_bullets(doc, [
    'A reader can register, log in, browse books, search in Somali or English, and read only authorized content.',
    'A reader can purchase a PDF or activate a subscription through a verified payment process.',
    'An administrator can manage books, users, subscriptions, payments, reports, and audit logs securely.',
    'The application is responsive on mobile and desktop, deployed to a stable environment, and backed up.',
    'The team can clearly explain ownership, release steps, and support responsibilities.',
])

# ── footer ──────────────────────────────────────────────────────────────

footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = footer.add_run('SomaLibrary Project Plan  |  Team Working Document  |  September 2026')
run.font.name = 'Aptos'
run.font.size = Pt(8)
run.font.color.rgb = RGBColor.from_string('52667A')

doc.core_properties.title = 'SomaLibrary Project Plan'
doc.core_properties.author = 'SomaLibrary Team'
doc.save(OUT)
print(f'Wrote {OUT}')
