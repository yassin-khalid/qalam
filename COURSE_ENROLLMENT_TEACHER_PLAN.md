# Course Enrollment Workflow — Frontend Implementation Plan (Teacher Side)

> Source: "السيناريو الأول — الاشتراك في دورة يرفعها المعلم" (Course Enrollment Workflow, approved revision).
> Scope: **teacher side only**. Student / guardian / checkout flows are deliberately out of scope.
> Stack: TanStack Start + Router + Query + DB + Form, nuqs, Tailwind v4, framer-motion, react-i18next (Arabic-first / RTL), zod.

---

## 1. Scenario summary (what we must support)

The PDF describes a complete enrollment lifecycle. On the **teacher side** we only own a subset of it. The teacher:

1. **Creates a course** and decides its identity:
   - `Fixed` → teacher pre-defines all sessions (title, description, subject, unit, lesson, files, homework, notes).
   - `Flexible` → teacher only defines the shell (subject, number of sessions, teaching mode). Each session's content is filled in by the student at request time.
2. **Publishes** the course (system validates content completeness, session existence, valid subject → status becomes `Published`).
3. **Reviews enrollment requests** (per course):
   - For `Fixed`: sees student, member count, requested days/times.
   - For `Flexible`: also sees student-proposed sessions (title/description/notes), requested content (subject/unit/lesson or freeform), and attachments.
   - Approves or rejects (with optional reason). On approve → request becomes `Approved` → moves to `PaymentPending` (student-side; teacher just sees the new state).
4. **After student pays**: enrollment moves to `Paid` → `Scheduled`. The system generates the scheduled sessions **per enrollment** (each enrollment has its own session set; sessions are not shared across enrollments).
5. **Runs sessions**: per scheduled session the teacher can upload files, add homework, attach content (own or from Content Library), write notes, mark attendance, end the session, and later see student feedback.
6. **Monitors via dashboard**: upcoming sessions, calendar, session history, content library, homework, files, earnings, payments, invoices, analytics, notifications.

### Course lifecycle states (visualise everywhere a status pill appears)

```
Draft → Published → EnrollmentRequested → Approved → PaymentPending
      → Paid → Scheduled → InProgress → Completed
      → Cancelled (terminal alternative)
```

The current `Course.status` numeric field (`1=draft, 2=published, 3=archived`) describes the **course**, not the enrollment. Enrollment lifecycle is tracked separately via `RequestStatus` (pending / approved / rejected / cancelled) — already defined in [enrollmentRequestsQueries.ts](src/routes/teacher/_authenticated/courses/-queries/enrollmentRequestsQueries.ts#L4-L10). The post-payment / scheduled / in-progress / completed states will need additional enums returned by backend on the `Enrollment` resource (see §6).

---

## 2. Gap analysis vs. the current codebase

| PDF Requirement (teacher side) | Status today | Notes |
|---|---|---|
| Teacher Courses list with status, revenue, enrolment count | ✅ Exists ([courses/route.tsx](src/routes/teacher/_authenticated/courses/route.tsx#L1-L130), [StatsGrid.tsx](src/routes/teacher/_authenticated/courses/-components/StatsGrid.tsx), [CourseCard.tsx](src/routes/teacher/_authenticated/courses/-components/CourseCard.tsx)) | Revenue column not surfaced — add to card / stats |
| Course Card quick actions (View, Enrollment Requests, Active Enrollments, Sessions, Analytics) | 🟡 Partial — only Enrollment Requests + Edit + Delete present | Add `View Details`, `Active Enrollments`, `Sessions`, `Analytics` entry points |
| Create Course — Basic Info (title, description, subject, type, mode, duration, price) | ✅ Exists ([courses/new/route.tsx](src/routes/teacher/_authenticated/courses/new/route.tsx)) | Already wired to TeacherSubjects, teachingModes, sessionTypes |
| Fixed-course Sessions Builder with per-session **unit / lesson / files / homework** | 🟡 Partial — only `title / durationMinutes / notes` per session today | Major extension needed (see §4.1) |
| Reorder sessions | ❌ Missing | Drag-and-drop or up/down buttons |
| Publish Course validation step | 🟡 Implicit (just POSTs payload) | Add explicit "Review & Publish" step + client-side checks mirroring backend rules |
| Course Details Page with tabs (Overview / Requests / Active Enrollments / Sessions / Content Library / Analytics) | ❌ Missing | New route: `/teacher/courses/$courseId` |
| Enrollment Requests view + Approve / Reject + Flexible request session details | ✅ Exists as modal ([EnrollmentRequestsModal.tsx](src/routes/teacher/_authenticated/courses/-components/EnrollmentRequestsModal.tsx)) | Reuse the same component as a Tab in Course Details; keep modal entry from card |
| Active Enrollments view | ❌ Missing | New tab + route |
| Per-enrollment Sessions list (date/time/Zoom/content/homework/files/notes) | ❌ Missing | Needs `Enrollment → Sessions` API |
| Session Details page (Information / Meeting / Files / Homework / Notes / Attendance / Feedback) | ❌ Missing | New route: `/teacher/sessions/$sessionId` |
| Teacher Dashboard sections: Courses / Sessions / Content / Finance / Analytics / Notifications | 🟡 Sidebar links exist but most target pages are not implemented | See §5 |
| Content Library (PDFs, images, video, homework templates) | ❌ Missing | New `/teacher/content` area |
| Calendar view of upcoming sessions | 🟡 Sidebar link only, page missing | Use existing `lib/components/calendar` primitives |

Legend: ✅ done · 🟡 partial · ❌ missing.

---

## 3. Routing & folder layout

Following the project's `-` private-folder convention (see [WARP.md](WARP.md#L29-L38)). New files in **bold**.

```
src/routes/teacher/_authenticated/
├── route.tsx                                      # auth gate + sidebar + navbar (exists)
├── courses/
│   ├── route.tsx                                  # list (exists)
│   ├── new/route.tsx                              # create/edit wizard (exists, extend)
│   ├── **$courseId/route.tsx**                    # Course Details (tabbed)
│   ├── **$courseId/-components/**
│   │   ├── **OverviewTab.tsx**
│   │   ├── **EnrollmentRequestsTab.tsx**          # wraps existing modal body
│   │   ├── **ActiveEnrollmentsTab.tsx**
│   │   ├── **SessionsByEnrollmentTab.tsx**
│   │   ├── **ContentLibraryTab.tsx**
│   │   └── **AnalyticsTab.tsx**
│   ├── -components/                               # existing list components
│   ├── -queries/                                  # existing + new
│   │   ├── courseDetailQueryOptions.ts            # exists
│   │   ├── enrollmentRequestsQueries.ts           # exists
│   │   ├── **activeEnrollmentsQueryOptions.ts**
│   │   ├── **enrollmentSessionsQueryOptions.ts**
│   │   ├── **publishCourseMutation.ts**
│   │   └── **courseAnalyticsQueryOptions.ts**
│   └── -types/                                    # existing
├── **sessions/**
│   ├── **route.tsx**                              # Upcoming Sessions + History list
│   ├── **calendar/route.tsx**                     # Calendar view (uses lib/components/calendar)
│   ├── **$sessionId/route.tsx**                   # Session Details (tabs below)
│   └── **$sessionId/-components/**
│       ├── **SessionInfoTab.tsx**
│       ├── **MeetingTab.tsx**                     # Zoom link / launch
│       ├── **FilesTab.tsx**
│       ├── **HomeworkTab.tsx**
│       ├── **NotesTab.tsx**
│       ├── **AttendanceTab.tsx**
│       └── **FeedbackTab.tsx**
├── **content/**
│   ├── **route.tsx**                              # Content Library landing
│   ├── **files/route.tsx**
│   ├── **homework/route.tsx**
│   └── **-components/**, **-queries/**, **-types/**
├── **finance/**
│   ├── **route.tsx**                              # Earnings overview
│   ├── **payments/route.tsx**
│   └── **invoices/route.tsx**
├── **analytics/route.tsx**                        # students count, completion rate, revenue
├── **notifications/route.tsx**                    # already a sidebar target — needs page
└── dashboard/                                     # already in sidebar; verify or add route.tsx
```

> Naming reminder: file-based routes generate types into `routeTree.gen.ts`. After adding any of the above, run `npm run dev` once so the plugin regenerates routes.

---

## 4. Detailed plan, screen by screen

For each screen I list: **purpose**, **data dependencies** (TanStack Query keys), **state** (nuqs / local / DB collection), and **components**.

### 4.1 Create Course — Fixed-course Sessions Builder upgrade

The PDF requires per-session: title, description, subject, **unit, lesson, files, homework, notes**. Today we store only `{ durationMinutes, title, notes }` in [sessionItemSchema](src/routes/teacher/_authenticated/courses/new/route.tsx#L37-L41). Extend it:

```ts
// inside courses/new/route.tsx
const sessionAttachmentSchema = z.object({
  id: z.string(),               // client-generated until uploaded
  fileName: z.string(),
  fileUrl: z.string().nullable(),
  fileType: z.enum(['pdf', 'image', 'video', 'doc', 'other']),
  sizeBytes: z.number().nullable(),
})

const sessionHomeworkSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  dueOffsetDays: z.number().nullable(),  // relative offset; absolute date assigned at scheduling time
  attachments: z.array(sessionAttachmentSchema).default([]),
})

const sessionItemSchema = z.object({
  // existing
  durationMinutes: z.number(),
  title: z.string().nullable(),
  notes: z.string().nullable(),
  description: z.string().nullable(),           // NEW
  // academic mapping
  unitId: z.number().nullable(),                // NEW
  lessonId: z.number().nullable(),              // NEW
  // content
  attachments: z.array(sessionAttachmentSchema).default([]),   // NEW
  homework: z.array(sessionHomeworkSchema).default([]),         // NEW
})
```

**New components** under `courses/new/-components/`:

- `SessionEditor.tsx` — replaces the inline editing block in the current `route.tsx`. Encapsulates one session and exposes `onChange(patch)`. Easier to add reorder + drag-handle later.
- `AcademicScopePicker.tsx` — cascading `Subject → Unit → Lesson` selectors. Subject is locked to the course's `teacherSubjectId`. New query options:
  - `unitsQueryOptions(teacherSubjectId, token)` → `['units', teacherSubjectId]`
  - `lessonsQueryOptions(unitId, token)` → `['lessons', unitId]`
- `SessionAttachmentsUploader.tsx` — supports PDF / image / video / doc. Use multipart upload through an existing pattern (see [objectToFormData.ts](src/lib/utils/objectToFormData.ts)). Show progress + per-file delete.
- `SessionHomeworkList.tsx` — add / edit / remove homework items inside a session.
- `SessionReorder.tsx` — buttons (↑ ↓) on each row is the lowest-risk first cut; promote to drag-and-drop (`@dnd-kit/core`) only if needed.

**Publish step**: add a third visual step inside the wizard (sticky right rail can become a `Stepper`). Before calling the publish endpoint, run client validation that mirrors backend:

- Title, description, teacherSubjectId, teachingMode, sessionType, price all set.
- If `isFlexible === false`: `sessions.length === sessionsCount` and **every** session has `durationMinutes > 0` and a valid `unitId/lessonId` (per PDF §"المعلم يحدد مسبقًا لكل Session").
- If any homework has attachments still in progress, block publish.

Publish mutation hits a dedicated endpoint (confirm with backend team — likely `POST /Api/V1/Teacher/TeacherCourse/{id}/Publish`). On success: `queryClient.invalidateQueries({ queryKey: ['courses'] })` and navigate to `/teacher/courses/$courseId`.

**`isFlexible === true` path**: hide the sessions builder entirely (already done). Only show the shell fields (subject, sessions count, duration, mode, type, price, max students). On publish, the backend just stores the framework — students will fill session details at enrollment time. We render them later in §4.4.

### 4.2 Course Details — `/teacher/courses/$courseId`

Top-level layout: header (title + subject + mode chips + status pill + actions: Edit, Delete, Duplicate) and a `Tabs` strip. Tab state goes in the URL with `nuqs` (`?tab=overview|requests|active|sessions|content|analytics`) so the user can refresh / share.

```tsx
const tabParam = parseAsStringLiteral([
  'overview','requests','active','sessions','content','analytics'
] as const).withDefault('overview')
```

**Tabs:**

1. **OverviewTab.tsx** — pulls from existing `courseDetailQueryOptions(id, token)` and a new `courseStatsQueryOptions(id, token)` that returns `{ totalEnrollments, activeEnrollments, totalRevenue, completionRate }`. Shows summary cards + course description + course type explainer (Fixed vs Flexible) + sessions outline (if Fixed).
2. **EnrollmentRequestsTab.tsx** — wrap the existing list/detail logic from [EnrollmentRequestsModal.tsx](src/routes/teacher/_authenticated/courses/-components/EnrollmentRequestsModal.tsx#L262-L348) without the modal chrome. Extract the inner content into a shared `<EnrollmentRequestsPanel courseId={id} />` and use it from both the card modal **and** this tab. The existing approve/reject mutations and Flexible-course detail rendering (proposedSessions, proposedScheduleDates, groupMembers, notes, attachments) already cover the PDF requirements.
3. **ActiveEnrollmentsTab.tsx** — new query `activeEnrollmentsQueryOptions(courseId, token)`:
   - `GET /Api/V1/Teacher/Enrollments?CourseId={id}&Status=Paid|Scheduled|InProgress`
   - Items: `{ id, studentName, studentCount, startDate, endDate, paidAmount, sessionsTotal, sessionsCompleted, status }`
   - Row actions: "View sessions" (deep-link to Sessions tab with `?enrollmentId=X`), "Open chat" (out of scope), "Cancel" (calls backend + reason dialog).
4. **SessionsByEnrollmentTab.tsx** — per PDF §"Sessions → By Enrollment". Two-pane layout: enrollment list on the start side, sessions of the selected enrollment on the other. Each session row shows date, time, status (`Scheduled / InProgress / Completed / Missed`), Zoom link button, and a "Open" action that routes to `/teacher/sessions/$sessionId`. URL state: `?enrollmentId=…`.
5. **ContentLibraryTab.tsx** — filtered view of the global Content Library scoped to this course. Reuses the components from `content/-components/` (see §4.5).
6. **AnalyticsTab.tsx** — minimal: enrollment count over time, completion rate, total revenue, average rating. Use a lightweight chart lib only if needed; for v1, summary cards + sparkline strings are fine.

### 4.3 Sessions area — `/teacher/sessions`, `/teacher/sessions/calendar`, `/teacher/sessions/$sessionId`

**List page** (`sessions/route.tsx`):
- Two segmented controls at top: `Upcoming` / `History`.
- Filter by course (dropdown), date range (use [DatePicker.tsx](src/lib/components/calendar/DatePicker.tsx)).
- Query: `upcomingSessionsQueryOptions({ from, to, courseId, status, page, pageSize })` against `GET /Api/V1/Teacher/Sessions`.
- Item card: course title, student(s), date/time, mode (Online/InPerson), status pill, Open button.

**Calendar page** (`sessions/calendar/route.tsx`):
- Reuse [CalendarGrid.tsx](src/lib/components/calendar/CalendarGrid.tsx) / [CalendarHijri.tsx](src/lib/components/calendar/CalendarHijri.tsx). Render sessions as month dots; click a day to open a side drawer of that day's sessions.
- Same query as list view, scoped by visible month.

**Session Details** (`sessions/$sessionId/route.tsx`):
- Tab strip (`nuqs`-driven): `info | meeting | files | homework | notes | attendance | feedback`.
- Header shows: session #, course title, student names, status pill, start/end time, countdown for upcoming, "End Session" button (Completed state) when status is `InProgress`.
- Tabs:
  - **SessionInfoTab** — date, time, teaching mode (online / in-person), academic scope (subject / unit / lesson), description. Read-only summary.
  - **MeetingTab** — Zoom link (copy / launch buttons). If session is in past + recording URL exists, show "Open recording".
  - **FilesTab** — list + uploader. Same uploader component used in course creation (§4.1).
  - **HomeworkTab** — list of homework items, "Add Homework" CTA, per-item view of student submissions (when status ≥ InProgress).
  - **NotesTab** — teacher-private notes editor with autosave (debounced PUT).
  - **AttendanceTab** — for each student in the enrollment, attendance status (`Present | Late | Absent`). Teacher toggles via a single-select chip group. Persists via `POST /Api/V1/Teacher/Sessions/{id}/Attendance`.
  - **FeedbackTab** — read-only view of student-submitted feedback / rating (only after session is Completed).

### 4.4 Flexible-course request detail (extension of §4.2 Requests tab)

The existing modal already renders `proposedSessions`, `proposedScheduleDates`, group members, notes, and rejection reasons. The PDF additionally requires showing per-session **attachments** the student uploaded with the request. Confirm with backend whether `proposedSessions[i]` carries an `attachments[]` field; if so, extend the `EnrollmentRequestProposedSession` interface in [enrollmentRequestsQueries.ts](src/routes/teacher/_authenticated/courses/-queries/enrollmentRequestsQueries.ts#L48-L53) and render a downloadable file list inside the existing `proposedSessions` block.

### 4.5 Content Library — `/teacher/content`

Cross-cutting library that the teacher can re-use across sessions / courses. PDF §"Content Library" + dashboard §"Content".

- `content/route.tsx` — tabs: `Files | Homework Templates`.
- `content/-queries/contentLibraryQueryOptions.ts` — `GET /Api/V1/Teacher/Content?type=file|homework&search=…&page=…`.
- Upload flow identical to per-session uploader (extract to `lib/components/FileUploader.tsx` so it is shared).
- "Use in session" action opens a `SessionPicker` modal that calls `POST /Api/V1/Teacher/Sessions/{id}/Content` to create a `SessionContentMapping` (PDF §"الجلسة ترتبط بالمحتوى عبر SessionContentMappings").

### 4.6 Finance, Analytics, Notifications

Out of strict scope for the enrollment workflow but listed in the dashboard section of the PDF. Stub pages now (with the same DashboardHeader pattern) so sidebar links don't 404, and wire them up when those endpoints land. Skeleton suggestions:

- `finance/route.tsx` — KPI cards (`Earnings`, `Pending Payouts`, `This-month Net`) + a table backed by `GET /Api/V1/Teacher/Finance/Earnings`.
- `analytics/route.tsx` — same KPI pattern. Reuses analytics queries from per-course tab if endpoints allow scope-less calls.
- `notifications/route.tsx` — list view backed by `GET /Api/V1/Teacher/Notifications`; mark as read on click.

---

## 5. Dashboard sidebar reconciliation

Current sidebar ([Sidebar.tsx](src/routes/teacher/_authenticated/-components/Sidebar.tsx#L84-L94)) already links to: dashboard, courses, calendar, suppliers, reports, notifications, settings, support. Per PDF §"Teacher Dashboard":

| PDF group | PDF items | Sidebar link today | Action |
|---|---|---|---|
| Courses | My Courses, Enrollment Requests, Active Enrollments | `Courses` (list) | Sub-items rendered inside Course Details tabs — keep sidebar single entry |
| Sessions | Upcoming, Calendar, History | `Calendar` only | Rename to "Sessions" with a sub-section, OR keep Calendar and add a "Sessions" item |
| Content | Library, Homework, Files | _none_ | Add **Content** nav item → `/teacher/content` |
| Finance | Earnings, Payments, Invoices | _none_ | Add **Finance** nav item → `/teacher/finance` |
| Analytics | Students Count, Completion Rate, Revenue | `Reports` | Repoint `Reports` → `/teacher/analytics` or rename |
| Notifications | new requests, payments, upcoming sessions | `Notifications` (with dot indicator already wired) | Implement page (currently link target is missing) |

The `Suppliers` link in the current sidebar is unrelated to the scenario and should be hidden or repurposed for teachers.

---

## 6. Backend contract — endpoints we depend on

These are the calls the teacher-side UI needs. Confirm exact paths / shapes with the backend team; the table reflects current code naming + sensible extensions.

### Already in use

| Purpose | Endpoint | File |
|---|---|---|
| List teacher courses | `GET /Api/V1/Teacher/TeacherCourse?pageNumber&status` | [courses/route.tsx](src/routes/teacher/_authenticated/courses/route.tsx#L37) |
| Course detail | `GET /Api/V1/Teacher/TeacherCourse/{id}` | [courseDetailQueryOptions.ts](src/routes/teacher/_authenticated/courses/-queries/courseDetailQueryOptions.ts#L79) |
| Create / update / delete course | `POST / PUT / DELETE /Api/V1/Teacher/TeacherCourse[/id]` | [new/route.tsx](src/routes/teacher/_authenticated/courses/new/route.tsx#L255), [courseDetailQueryOptions.ts](src/routes/teacher/_authenticated/courses/-queries/courseDetailQueryOptions.ts#L59) |
| Teaching modes / session types / subjects | `GET /Api/V1/Teaching/...` and `GET /Api/V1/Teacher/...Subjects` | [sessionTypesQueryOptions.ts](src/routes/teacher/_authenticated/courses/new/-queries/sessionTypesQueryOptions.ts) and siblings |
| Enrollment requests list/detail/approve/reject | `GET/POST /Api/V1/Teacher/EnrollmentRequests[...]` | [enrollmentRequestsQueries.ts](src/routes/teacher/_authenticated/courses/-queries/enrollmentRequestsQueries.ts) |

### To request from backend

| Purpose | Suggested endpoint | Notes |
|---|---|---|
| Publish a course | `POST /Api/V1/Teacher/TeacherCourse/{id}/Publish` | Server-side validation re-run |
| Units / Lessons | `GET /Api/V1/Teacher/TeacherSubjects/{id}/Units`, `GET .../Units/{id}/Lessons` | Cascading pickers in Sessions Builder |
| Upload file | `POST /Api/V1/Teacher/Content/Upload` (multipart) | Returns `{ id, url, type, sizeBytes }` |
| Attach file to course-session template | `POST /Api/V1/Teacher/TeacherCourse/{id}/Sessions/{idx}/Attachments` | Or send inline in the course PUT payload — confirm |
| Active enrollments | `GET /Api/V1/Teacher/Enrollments?CourseId=&Status=` | Needs an `EnrollmentStatus` enum (`Paid / Scheduled / InProgress / Completed / Cancelled`) |
| Enrollment sessions | `GET /Api/V1/Teacher/Enrollments/{id}/Sessions` | Per-enrollment, **not** per-course |
| Session detail | `GET /Api/V1/Teacher/Sessions/{id}` | Includes Zoom link, attendance, content mappings |
| Update session content / homework / notes | `PUT /Api/V1/Teacher/Sessions/{id}` (partial) | Or sub-resources |
| Attach Content Library item to session | `POST /Api/V1/Teacher/Sessions/{id}/Content` | Creates `SessionContentMapping` |
| Attendance | `POST /Api/V1/Teacher/Sessions/{id}/Attendance` | `[{ studentId, status }]` |
| End session | `POST /Api/V1/Teacher/Sessions/{id}/End` | Transitions `InProgress → Completed` |
| Content Library list | `GET /Api/V1/Teacher/Content?type=&search=` | |
| Course analytics | `GET /Api/V1/Teacher/TeacherCourse/{id}/Analytics` | revenue, completionRate, enrollmentTrend |
| Upcoming sessions | `GET /Api/V1/Teacher/Sessions?from=&to=&status=&courseId=` | |
| Notifications | `GET /Api/V1/Teacher/Notifications` + `POST .../{id}/Read` | |

All requests must continue to use the existing header pattern: `Authorization: Bearer {token}`, `Accept-Language: ar-EG`, `Accept: application/json`. Reuse the `buildHeaders(token)` helper from [enrollmentRequestsQueries.ts](src/routes/teacher/_authenticated/courses/-queries/enrollmentRequestsQueries.ts#L106-L111) and consider promoting it to `src/lib/utils/apiHeaders.ts` so every new query file shares it.

---

## 7. State, validation, and UX conventions to keep

These are already enforced in the codebase — keep them consistent for all new screens:

1. **URL-first state** — anything the user might refresh or share (active tab, selected enrollment, page number, status filter) goes in `nuqs` search params with Zod / `parseAsStringLiteral` schemas. See pattern in [courses/new/route.tsx](src/routes/teacher/_authenticated/courses/new/route.tsx#L64-L83).
2. **Server state via TanStack Query** — every new endpoint gets a `*QueryOptions` factory file under the route's `-queries/` folder. Mutations call `queryClient.invalidateQueries({ queryKey: [...] })` on success.
3. **Validation** — `zod` schemas live next to the route. Re-use `parseErrorMessage` helper (currently inline in `courses/new/route.tsx`) — extract to `src/lib/utils/parseApiError.ts` since we'll need it everywhere.
4. **Toasts** — `showToast({ type: 'success' | 'server' | 'validation', message })` (see [toast.tsx](src/lib/utils/toast.tsx)). Don't introduce a new toast lib.
5. **i18n** — every visible string in [ar/teacher.ts](src/lib/i18n/locales/ar/teacher.ts) + [en/teacher.ts](src/lib/i18n/locales/en/teacher.ts) under a stable key path. New keys go under `teacher:courses.detail.*`, `teacher:sessions.*`, `teacher:content.*`, etc.
6. **RTL** — always wrap top-level route shells in `<div dir={LOCALE_DIRECTION[locale]}>` and use `start-*` / `end-*` Tailwind utilities, not `left-*` / `right-*`.
7. **Theming** — use semantic class names already in use (`bg-primary` / `dark:bg-secondary`, `bg-slate-*` scale, `text-rose-*` for destructive). Status pills follow the existing `RequestStatusStyles` palette.
8. **Auth fallback** — every new query/mutation must mirror the pattern in [courses/route.tsx](src/routes/teacher/_authenticated/courses/route.tsx#L33-L36): if token is missing, `navigate({ to: '/teacher/register', search: { step: 0, authSubStep: 'phone' } })`.

---

## 8. Suggested delivery phases

Order the work so each phase ships a coherent slice and unblocks the next. Each phase is a candidate PR; estimates assume one engineer.

### Phase 1 — Course Details surface (~1 sprint)
- New route `courses/$courseId/route.tsx` with a Tabs shell (URL-driven).
- OverviewTab + AnalyticsTab (skeleton using existing course detail).
- Extract `EnrollmentRequestsPanel` from the modal and reuse inside `EnrollmentRequestsTab`.
- Wire CourseCard "View Details" button to the new route.

### Phase 2 — Sessions Builder upgrade for Fixed courses (~1 sprint)
- Extend `sessionItemSchema` (unit, lesson, description, attachments, homework).
- `AcademicScopePicker`, `SessionAttachmentsUploader`, `SessionHomeworkList`, `SessionEditor` components.
- Reorder controls (up/down buttons first).
- Explicit Publish step + client validation + new `publishCourse` mutation.

### Phase 3 — Active Enrollments + per-enrollment Sessions (~1 sprint)
- `activeEnrollmentsQueryOptions`, `enrollmentSessionsQueryOptions`.
- ActiveEnrollmentsTab + SessionsByEnrollmentTab.
- Cross-link to the new Session Details route.

### Phase 4 — Session Details page (~1 sprint)
- `sessions/$sessionId/route.tsx` with seven tabs.
- Attendance + Notes + End Session mutations.
- Reuse FileUploader and HomeworkList.

### Phase 5 — Content Library, Calendar, Finance/Analytics/Notifications stubs (~1 sprint)
- `content/*` routes + global FileUploader extraction.
- `sessions/calendar/route.tsx` reusing `lib/components/calendar/*`.
- Skeleton pages so sidebar links resolve.

### Phase 6 — Polish (~½ sprint)
- Flexible-course request attachment rendering once backend confirms shape.
- Empty states, loading skeletons, error boundaries for each new route.
- i18n pass: add missing AR/EN keys, verify RTL on every new screen.
- Lighthouse / a11y check on each new page.

---

## 9. Open questions to confirm with backend before starting

1. Is `Publish` a separate endpoint, or is it implied by setting `status=2` on update? The PDF describes server-side validation gates — easier if it's its own endpoint.
2. Schema for `Units` and `Lessons` per `TeacherSubject` — are these flat or curriculum-scoped?
3. Where does the file uploader POST to, and what max size / mime types are allowed for `pdf | image | video | doc`?
4. Is there a single `Enrollment` resource with the full lifecycle (`Paid → Scheduled → InProgress → Completed → Cancelled`) and does it expose `sessions[]`, or do we have to compose from two endpoints?
5. For Flexible requests, do `proposedSessions[i]` carry student-uploaded attachments? If so, we need the attachment array in the response.
6. Does the backend create the Zoom link automatically when an enrollment is `Paid`, or does the teacher trigger it?
7. Attendance model — one row per student per session, with status enum + optional notes?
8. Is there a notifications stream (SSE / polling) the dashboard should subscribe to, or is it pull-only?

---

## 10. Quick reference — component naming cheatsheet

| Concern | New file | Reuses |
|---|---|---|
| File upload (PDF/image/video/doc) | `src/lib/components/FileUploader.tsx` | shared everywhere |
| Cascading subject → unit → lesson picker | `courses/new/-components/AcademicScopePicker.tsx` | new queries |
| Tabs primitive (URL-driven) | `src/lib/components/Tabs.tsx` | `nuqs` |
| Status pill | `src/lib/components/StatusPill.tsx` | maps any enum → tailwind classes |
| Empty state | `src/lib/components/EmptyState.tsx` | used by every list |
| Stepper for create-course wizard | `src/lib/components/Stepper.tsx` | new |

---

**TL;DR for the team:**
- Course list + create form + enrollment-requests modal exist. Everything else is greenfield.
- Priority order: Course Details page → Sessions Builder upgrade → Active Enrollments + per-enrollment Sessions → Session Details → Content Library → ancillary dashboard pages.
- Stick to existing patterns: nuqs URL state, TanStack Query factories per `-queries/` folder, i18n keys, RTL, `showToast`, `Bearer + Accept-Language: ar-EG`.
- Send the backend team the table in §6 to lock the endpoint contract before Phase 2 starts.
