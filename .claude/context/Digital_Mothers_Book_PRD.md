# Product Requirements Document (PRD)
## Digital Mother's Book

**Status:** PRD v1.2 – In Active Development
**Last Updated:** January 2026
**Platform:** Mobile (iOS & Android) | React Native + Expo
**Geography:** Philippines

> **✅ IMPLEMENTATION STATUS**
> **The application uses Convex as the backend-as-a-service platform, providing real-time database, authentication, and serverless functions.**
> This approach provides real-time data synchronization, type-safe database operations, and eliminates the need for separate backend infrastructure.
> See [Section 15](#15-technical-architecture) for technical details.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Vision & Goals](#2-vision--goals)
3. [Target Users & Personas](#3-target-users--personas)
4. [Platform & Scope](#4-platform--scope)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Core Features & Requirements](#6-core-features--requirements)
7. [Notifications](#7-notifications)
8. [MVP Definition](#8-mvp-definition)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Monetization (Future)](#10-monetization-future)
11. [Risks & Open Questions](#11-risks--open-questions)
12. [Success Metrics (Post-MVP)](#12-success-metrics-post-mvp)
13. [User Flows](#13-user-flows)
14. [Edge Cases & Product Rules](#14-edge-cases--product-rules)
15. [Technical Architecture](#15-technical-architecture)

---

## 1. Product Overview

The **Digital Mother's Book** is a mobile-first healthcare application designed to digitalize traditional maternal health records ("mother's books") in the Philippines. The product enables OB-GYNs to efficiently manage patient records while empowering pregnant women and new mothers to securely store, view, and manage their maternal and vaccination records.

The application is delivered as **one mobile app with role-based access** for Doctors and Mothers, ensuring seamless interaction, secure data sharing, and faster iteration.

### Key Differentiators
- **Mother-controlled data ownership** with QR-based consent
- **Booklet-level access control** for maximum privacy
- **Voice-to-text medical entry** for doctor efficiency
- **Single unified app** with role-based navigation

---

## 2. Vision & Goals

### Vision
To streamline and digitalize maternal health record-keeping, making it easier for doctors to manage patient care and for mothers to track their pregnancy and postnatal journey.

### Goals
- Replace paper-based mother's books with a secure digital alternative
- Reduce administrative burden for OB-GYNs
- Improve continuity and accuracy of maternal healthcare records
- Enable mothers to discover and connect with doctors
- Create a scalable platform for future healthcare integrations

---

## 3. Target Users & Personas

### 3.1 OB-GYN / Doctor Persona
- Licensed OB-GYN practicing in the Philippines
- Manages multiple patients daily
- Needs fast data entry and clear patient records
- Wants visibility to attract new patients

**Pain Points:**
- Time-consuming manual record-keeping
- Difficulty tracking patient history across visits
- Limited patient acquisition channels

### 3.2 Mother / Patient Persona
- Pregnant woman or new mother
- Uses a smartphone regularly
- Wants a simple, trustworthy way to track pregnancy records
- May not yet have a regular OB-GYN

**Pain Points:**
- Lost or damaged paper records
- Difficulty finding qualified doctors
- Lack of visibility into medical history
- Concerns about data privacy

---

## 4. Platform & Scope

- **Platform:** Mobile (iOS & Android)
- **Framework:** React Native with Expo SDK 54 (New Architecture enabled)
- **Routing:** Expo Router (file-based navigation)
- **Styling:** NativeWind v4 (Tailwind CSS for React Native)
- **Geography:** Philippines (PH)
- **Architecture:** Single app, role-based navigation
- **Backend:** Convex (real-time database, authentication, serverless functions)
- **Authentication:** Convex Auth with email/password
- **State Management:** Zustand (auth state), Convex hooks (data)
- **Local Storage:** MMKV (theme preferences)

---

## 5. User Roles & Permissions

### Doctor Role
- **Can** only access mothers who explicitly grant access via QR code
- **Can** create and update medical entries
- **Cannot** modify mother personal profile data
- **Cannot** search for or manually add mothers

### Mother Role
- **Owns** and controls her mother's booklet(s)
- **Grants** or revokes doctor access per booklet
- **Can** view but not edit doctor-created medical entries
- **Can** manage multiple booklets (e.g., different pregnancies)

### Key Principle
**Mother owns the data; doctors are granted scoped access.**

---

## 6. Core Features & Requirements

### 6.1 Doctor Features

#### 6.1.1 Patient List (Mother's Books)
Display **booklet-level list view** of mothers under doctor's care.

**Each list item includes:**
- Mother name
- Booklet label (e.g., "Pregnancy 2026")
- Last visit date
- Next appointment (if available)

**Acceptance Criteria:**
- Doctor sees only booklets with active access
- No calendar or alternate views available in MVP
- Same mother may appear multiple times if multiple booklets are shared
- List is optimized for speed (flat structure, no nested navigation)

#### 6.1.2 Digital Mother's Book Management
Add new check-up entries containing:
- Check-up notes
- Doctor's instructions
- Ultrasound references
- **Voice-to-text input** for instructions and notes (MVP requirement)

**Acceptance Criteria:**
- Entries are immediately visible in the mother's booklet
- Voice input accurately converts to editable text
- All entries are append-only (no silent overwrites)

#### 6.1.3 Labs & Medication Records
Create and update:
- Lab request checklist
- Medication intake records
- Data stored inside the mother's booklet only

**Acceptance Criteria:**
- Records appear only within booklet views
- No separate lab or medication dashboards for mothers
- Medications can be marked as active/inactive
- Lab requests can be marked as pending/completed

#### 6.1.4 Doctor Profile & Listing
Doctor registration with:
- Name
- Birthdate
- Contact number
- Email
- Clinic address
- Clinic schedule
- PRC number
- Location links via Google Maps / Waze

**Visibility:**
- Profiles are searchable in the mother's doctor directory
- Future monetization: paid/sponsored listings

#### 6.1.5 Doctor Dashboard
Summary view including:
- Upcoming appointments
- Pending lab requests
- Active medications per patient

---

### 6.2 Mother / Patient Features

#### 6.2.1 Digital Mother's Booklet
Personal digital booklet(s) containing:
- Check-up history
- Doctor instructions
- Lab request checklist
- Medication intake records

**Multiple Booklets:**
- Mothers can create multiple booklets (e.g., different pregnancies, different children)
- Each booklet has independent access controls
- Booklets can be labeled (e.g., "Pregnancy 2026", "Baby #2")
- Booklets can be archived

#### 6.2.2 Doctor Connection (QR-Based)
**QR Generation:**
1. Mother opens a specific booklet
2. Mother taps "Generate QR for Doctor"
3. System generates a time-limited QR (5-10 minutes) encoding:
   - `booklet_id`
   - `mother_id` (internal)
   - Expiry timestamp

**Doctor Scanning:**
1. Doctor scans the mother-generated QR code
2. System validates QR (exists, not expired)
3. Doctor gains access to that specific booklet
4. Booklet appears in doctor's patient list

**Access Revocation:**
- Mother can revoke doctor access at any time
- Revocation is booklet-specific
- Historical entries remain intact

**Acceptance Criteria:**
- Only mother-generated QR codes grant access
- Doctor cannot add or access a mother without scanning QR
- Revoking access immediately removes doctor visibility
- QR codes expire after time limit

#### 6.2.3 Profile & Baby Information
- Add / edit baby name
- Upload and display profile photo
- Update personal information

#### 6.2.4 Doctor Discovery
Browse doctor directory with search by:
- Location
- Doctor name
- Clinic or hospital name

**Features:**
- View doctor profiles
- See clinic locations on map
- Get directions via Google Maps / Waze

#### 6.2.5 App Navigation (Global)
Three persistent tabs across the app:
1. **Home / Overview** – reminders & next appointment
2. **Mother's Booklet** – full medical record(s)
3. **Profile** – personal and baby info

---

## 7. Notifications

Push notifications for:
- Appointment reminders
- Medication reminders
- Lab follow-ups

**Triggered from booklet data.**

---

## 8. MVP Definition

### 🚧 Phase 1: Sample Data Implementation
**For initial development, the application will use sample/mock data and operate without server connectivity.**

This approach allows:
- Rapid UI/UX iteration and testing
- User flow validation without backend dependencies
- Demonstration of core features to stakeholders
- Parallel frontend and backend development

**Sample Data Includes:**
- Pre-populated mother profiles and booklets
- Mock doctor profiles and listings
- Sample medical entries with timestamps
- Example lab requests and medications
- Simulated QR code generation and scanning
- Mock notification triggers

**Implementation Notes:**
- Use local storage (AsyncStorage) for data persistence
- Implement same data structure as planned database schema
- Include realistic medical terminology and Filipino names
- Provide multiple sample booklets per mother for testing
- Enable easy reset to default sample data

**Transition to Server:**
- Phase 2 will integrate with PostgreSQL backend
- Sample data structure matches production schema
- API integration points clearly marked in code
- Migration path from local to remote data defined

### ✅ Included in MVP
- Single role-based mobile app
- Digital mother's booklet (with multi-booklet support)
- QR-based doctor–mother linking (simulated)
- Doctor directory & listings
- Doctor patient list (booklet-level list view)
- Medical entry creation
- Voice-to-text input
- Lab & medication tracking
- Notifications (local only)
- Booklet-specific access control (simulated)

### ❌ Excluded from MVP
- Server connectivity and API integration (Phase 1)
- Calendar views
- Data export / PDF
- Advanced analytics
- Hospital system integrations
- Telemedicine features
- Payment processing
- Real-time synchronization (Phase 1)

---

## 9. Non-Functional Requirements

### Security & Privacy
- Compliance with **PH Data Privacy Act (RA 10173)**
- Encryption at rest and in transit
- Role-based access control
- QR codes are time-limited and single-use per access grant
- Audit logging for all access and modifications

### Performance
- App load < 3 seconds on average devices
- Offline-read support (Phase 2)
- Optimized database queries for doctor's booklet list

### Reliability
- Data persistence with audit logging (Phase 2)
- Graceful degradation for offline scenarios
- Automatic data synchronization

### Accessibility
- Support for Filipino and English languages
- Clear, readable fonts for medical information
- Voice-to-text accuracy for medical terminology

---

## 10. Monetization (Future)

Potential revenue streams:
- Paid doctor listings (premium placement)
- Sponsored doctor profiles
- In-app ads (non-intrusive)
- Premium features for doctors (analytics, templates)

---

## 11. Risks & Open Questions

### Risks
- Regulatory approvals for medical data handling
- Doctor onboarding friction
- User trust & data accuracy
- Voice-to-text accuracy for medical terminology
- Network connectivity in rural areas

### Open Questions
- What is the optimal QR code expiry time?
- Should mothers be able to add their own medical notes?
- How do we handle doctor license verification?
- What happens if a doctor's PRC number is revoked?

---

## 12. Success Metrics (Post-MVP)

**User Acquisition:**
- Number of active mothers
- Number of registered doctors
- New user signups per month

**Engagement:**
- Percentage of active booklet usage
- Average number of medical entries per booklet
- Doctor patient list access frequency

**Retention:**
- Retention rate (30/60/90 days)
- Booklet updates per week
- QR code generation frequency

**Quality:**
- Voice-to-text accuracy rate
- Average time to complete medical entry
- User satisfaction scores

---

## 13. User Flows

The following user flows define high-level product behavior for consent, access, and record updates. Detailed UI implementation is out of scope for this document.

### Flow 1: Mother Selects Booklet → Generates QR

**Actors:** Mother, System

1. Mother navigates to the **Mother's Booklet** tab
2. Mother selects a specific booklet from her list (if multiple exist)
3. Mother taps **"Generate QR for Doctor"**
4. System generates a time-limited QR code (5-10 minutes) encoding:
   - `booklet_id`
   - `mother_id` (internal reference)
   - Expiry timestamp
5. QR code is displayed on screen for doctor to scan

**Outcome:** QR is tied to one specific booklet only.

---

### Flow 2: Doctor Scans QR → Gains Booklet Access

**Actors:** Doctor, Mother, System

1. Doctor opens app → **Scan QR** function
2. Doctor scans the mother-generated QR code
3. System validates QR:
   - QR exists in database
   - QR has not expired
   - QR has not been used (or allows multiple uses per design decision)
4. System performs:
   - Adds mother profile to doctor's records (if new mother)
   - Creates `booklet_access` record
   - Adds the specific booklet to doctor's accessible list
5. Doctor can now view and update the booklet
6. Booklet appears as a row in doctor's patient list

**Outcome:** Access granted to a single booklet. Other booklets (if any) remain inaccessible unless separate QR codes are generated.

---

### Flow 3: Doctor Adds Medical Entry → Mother Views Update

**Actors:** Doctor, Mother, System

1. Doctor opens a booklet from their patient list
2. Doctor navigates to **Add Entry**
3. Doctor selects entry type:
   - Check-up
   - Instruction
   - Ultrasound
4. Doctor uses voice-to-text or manual input to add:
   - Notes
   - Instructions
   - Lab requests
   - Medications
5. Doctor saves entry
6. System stores entry in the booklet
7. Mother sees update in real time (notification sent if enabled)
8. Entry appears in mother's booklet with timestamp and doctor attribution

**Outcome:** Medical record is updated and visible to both parties.

---

### Flow 4: Mother Revokes Doctor Access

**Actors:** Mother, System

1. Mother opens a specific booklet
2. Mother navigates to **Authorized Doctors** section
3. Mother views list of doctors with access to this booklet
4. Mother selects a doctor
5. Mother taps **"Revoke Access"**
6. System confirms action
7. System sets `revoked_at` timestamp in `booklet_access` table
8. Doctor immediately loses access to that booklet
9. Booklet is removed from doctor's patient list

**Outcome:** Access removed for one booklet only. Historical medical entries remain intact. Other booklets (if shared) remain unaffected.

---

### Flow 5: Doctor Views Patient List (Booklet-Level)

**Actors:** Doctor, System

1. Doctor opens app → **Dashboard** or **Patient List**
2. System displays a flat list of all accessible booklets
3. Each row includes:
   - Mother name
   - Booklet label (e.g., "Pregnancy 2026")
   - Last visit date
   - Next appointment (if scheduled)
4. Doctor taps a row
5. Booklet opens directly with full medical history

**Outcome:** Doctor can quickly access any patient's booklet with minimal taps.

---

### Flow 6: Mother Discovers and Connects with Doctor

**Actors:** Mother, System

1. Mother opens app → **Doctor Directory**
2. Mother searches or browses doctors by:
   - Location (map view)
   - Doctor name
   - Clinic name
3. Mother views doctor profile including:
   - Credentials (PRC number)
   - Clinic information
   - Schedule
   - Location (with map integration)
4. Mother schedules appointment (future feature) or visits clinic
5. During visit, mother generates QR code for doctor to scan

**Outcome:** Mother finds a doctor and establishes digital connection.

---

## 14. Edge Cases & Product Rules

### A. Booklet Ownership & Scope

**Multiple Booklets:**
- Mothers may own multiple booklets (e.g., different pregnancies, different children)
- Each booklet operates independently
- Booklets can be labeled for easy identification
- Booklets can be archived but not deleted (data retention)

**Access Control:**
- Access permissions are **booklet-specific, not account-wide**
- Granting access to one booklet does not grant access to other booklets
- Each booklet maintains its own list of authorized doctors

---

### B. Doctor Patient List Behavior

**List Structure:**
- Doctor patient list is **booklet-level** (not mother-level)
- Each booklet appears as a separate row
- Same mother name may appear multiple times if multiple booklets are shared
- This design prioritizes speed: one tap to access any booklet

**Example:**
```
Doctor's Patient List:
- Maria Santos | Pregnancy 2026 | Last visit: Jan 5
- Maria Santos | Baby #1 Checkups | Last visit: Dec 20
- Ana Cruz | Pregnancy 2025 | Last visit: Jan 8
```

---

### C. QR Code Rules

**Generation:**
- QR codes can only be generated by mothers
- QR codes are time-limited (5-10 minutes, configurable)
- One QR grants access to one specific booklet
- QR codes can be regenerated as needed

**Expiry Handling:**
- Expired QR codes cannot be scanned
- System shows error message: "This QR code has expired. Please ask the mother to generate a new one."
- Mother must regenerate QR from the same booklet

**Security:**
- QR codes are cryptographically signed
- QR codes contain no PHI (Protected Health Information) directly
- QR codes reference internal IDs only

---

### D. Access & Revocation

**Doctor Limitations:**
- Doctors **cannot search for or manually add mothers**
- Doctors can only access mothers who scan QR codes
- Doctors cannot request access to additional booklets
- Doctors cannot see that other booklets exist

**Revocation Rules:**
- Revoking access removes only the affected booklet
- Historical medical entries remain intact and visible to mother
- Doctor entries are attributed even after access revocation
- Revoked doctors cannot re-gain access without new QR scan

---

### E. Duplicate Scans & Multiple Access

**Scenario: Doctor scans QR for same booklet twice**
- System recognizes existing access
- No duplicate access records created
- Confirmation message: "You already have access to this booklet"

**Scenario: Doctor scans QRs for different booklets from same mother**
- Each booklet is added as a separate row in doctor's patient list
- No duplicate mother profile created
- Access is independently managed per booklet

---

### F. Data Ownership & Auditability

**Mother Ownership:**
- Mother is the **data owner**
- Doctor is a **permitted contributor** with explicit consent
- Mother can view all entries even after revoking doctor access
- Mother cannot edit doctor-created entries (data integrity)

**Audit Trail:**
- All medical entries are **append-only**
- Each entry records:
  - Creating doctor
  - Timestamp
  - Entry type
- System maintains audit log of:
  - Access grants
  - Access revocations
  - Medical entry creation
  - Profile updates

---

### G. Lost Phone / Reinstall

**Doctor Account:**
- Patient list (booklet access) restored after login
- All historical data preserved
- No re-scanning required

**Mother Account:**
- All booklets restored after login
- Medical history preserved
- Access permissions preserved
- Previously generated QR codes are invalid (new session = new QRs)

---

### H. Offline Scenarios

**Phase 2 Feature:**
- Read access to previously loaded booklets
- Queue medical entries for sync when online
- Warning indicator for offline state
- Conflict resolution for concurrent edits

---

### I. Doctor License Verification

**MVP Assumption:**
- PRC number collected during registration
- Manual verification process (future: API integration)
- Unverified doctors have limited visibility in directory

**Future State:**
- Automated PRC number verification via API
- Regular re-verification checks
- Revocation handling for expired licenses

---

### J. Data Migration & Export

**Post-MVP:**
- Export booklet as PDF
- Import data from other systems
- Bulk data operations
- Compliance reporting

---

## 15. Technical Architecture

### 15.1 High-Level Architecture

**Phase 1: Sample Data (Current MVP)**
```
┌─────────────────────────────────────────┐
│     Mobile App (React Native)           │
│  ┌────────────┐      ┌────────────┐    │
│  │   Doctor   │      │   Mother   │    │
│  │    View    │      │    View    │    │
│  └────────────┘      └────────────┘    │
│         │                    │          │
│         └────────────────────┘          │
│                  │                      │
│         ┌────────▼────────┐            │
│         │  Sample Data    │            │
│         │  (AsyncStorage) │            │
│         └─────────────────┘            │
└─────────────────────────────────────────┘
```

**Phase 2: Server Integration (Future)**
```
┌─────────────────────────────────────────┐
│     Mobile App (React Native)           │
│  ┌────────────┐      ┌────────────┐    │
│  │   Doctor   │      │   Mother   │    │
│  │    View    │      │    View    │    │
│  └────────────┘      └────────────┘    │
│         │                    │          │
│         └────────────────────┘          │
│                  │                      │
└──────────────────┼──────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │   REST API      │
         │  (Node.js)      │
         └─────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │   PostgreSQL    │
         │    Database     │
         └─────────────────┘
```

### 15.2 Phase 1: Sample Data Implementation

**Data Storage:**
- **AsyncStorage** for local data persistence
- JSON structure mirroring production database schema
- Separate storage keys for each entity type:
  - `@users`
  - `@doctor_profiles`
  - `@mother_profiles`
  - `@mother_booklets`
  - `@booklet_access`
  - `@medical_entries`
  - `@medications`
  - `@lab_requests`

**Sample Data Structure:**
```javascript
// Example: Sample Mother Booklet
{
  "id": "booklet-001",
  "mother_id": "mother-001",
  "label": "Pregnancy 2026",
  "status": "active",
  "created_at": "2025-08-15T10:00:00Z",
  "medical_entries": [
    {
      "id": "entry-001",
      "doctor_id": "doctor-001",
      "entry_type": "checkup",
      "notes": "First trimester checkup. All vitals normal.",
      "visit_date": "2025-09-01",
      "created_at": "2025-09-01T14:30:00Z"
    }
  ]
}
```

**Mock Services:**
- QR code generation (local UUID + timestamp)
- QR code scanning (validation against local data)
- Voice-to-text simulation (or actual STT if API available)
- Local notifications (React Native local notifications)

**Data Reset Functionality:**
- Development menu to reset to default sample data
- Clear all data and reload predefined samples
- Useful for demos and testing

### 15.3 Phase 2: Server Integration Planning

**Transition Checklist:**
- [ ] Backend API development (Node.js + Express)
- [ ] PostgreSQL database setup and migrations
- [ ] API endpoint implementation (see 15.5)
- [ ] Authentication service integration (JWT)
- [ ] Update mobile app to use API services
- [ ] Data migration from local to server
- [ ] Implement sync mechanism for offline support
- [ ] Security audit and penetration testing

**Benefits of Sample Data First:**
- Validates user flows before backend investment
- Allows UI/UX refinement based on user feedback
- Reduces development timeline for initial prototype
- Enables parallel frontend/backend development
- Provides clear API contract from actual usage

### 15.4 Data Model Summary

**Core Entities:**
- `users` - Authentication accounts
- `doctor_profiles` - Doctor information
- `mother_profiles` - Mother information
- `mother_booklets` - Pregnancy/child records
- `booklet_access` - Access control table
- `medical_entries` - Doctor-created records
- `lab_requests` - Lab tests
- `medications` - Medication prescriptions
- `medication_intake_logs` - Medication tracking
- `qr_tokens` - Time-limited consent tokens

**Key Relationships:**
```
User (1:1) → DoctorProfile
User (1:1) → MotherProfile
MotherProfile (1:N) → MotherBooklet
MotherBooklet (1:N) → MedicalEntry
MotherBooklet (1:N) → BookletAccess
MedicalEntry (1:N) → LabRequest
MedicalEntry (1:N) → Medication
```

### 15.5 Database Design Principles

1. **Mother owns the data; doctors are granted scoped access**
2. **Access is booklet-specific, not account-wide**
3. **All medical entries are append-only** (no silent overwrites)
4. **Optimized for:**
   - Doctor speed (flat booklet list)
   - Auditability
   - Future compliance

### 15.6 API Endpoints (High-Level - Phase 2)

**Authentication:**
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

**Mother Endpoints:**
- `GET /mother/booklets`
- `POST /mother/booklets`
- `GET /mother/booklets/:id`
- `POST /mother/booklets/:id/generate-qr`
- `DELETE /mother/booklets/:id/access/:doctorId`
- `GET /mother/doctors/search`

**Doctor Endpoints:**
- `GET /doctor/patients` (returns booklet-level list)
- `POST /doctor/scan-qr`
- `GET /doctor/booklets/:id`
- `POST /doctor/booklets/:id/entries`
- `POST /doctor/booklets/:id/labs`
- `POST /doctor/booklets/:id/medications`

**Shared Endpoints:**
- `GET /profile`
- `PUT /profile`

**Note:** These endpoints will be implemented in Phase 2 when server integration begins.

### 15.7 Security Considerations (Phase 2)

**Authentication:**
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- Rate limiting on sensitive endpoints

**Data Protection:**
- Encryption at rest (database-level)
- Encryption in transit (TLS/SSL)
- PHI handling compliance

**Access Control:**
- Booklet access verified on every request
- QR tokens cryptographically signed
- Audit logging for all sensitive operations

### 15.8 Scalability Considerations (Phase 2)

**Database:**
- Indexing strategy:
  - `mother_booklets(mother_id)`
  - `booklet_access(doctor_id, revoked_at)`
  - `medical_entries(booklet_id, created_at)`
  - `qr_tokens(booklet_id, expires_at)`

**Caching:**
- Redis for session management
- Cache doctor patient lists
- Cache QR token validation

**File Storage:**
- Cloud storage for ultrasound images
- CDN for profile photos
- Encrypted storage for PHI

---

## Appendix A: Detailed Data Model

For complete database schema, entity relationships, and field definitions, refer to the separate **Data Model & Entities** document:

### Entity Overview

#### 1. Users & Authentication
**Table: `users`**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | Global user ID |
| email | TEXT | Unique |
| role | ENUM | doctor, mother |
| created_at | TIMESTAMP | |

#### 2. Doctor Profiles
**Table: `doctor_profiles`**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK) | → users.id |
| full_name | TEXT | |
| prc_number | TEXT | Indexed |
| clinic_name | TEXT | |
| clinic_address | TEXT | |
| contact_number | TEXT | |
| created_at | TIMESTAMP | |

#### 3. Mother Profiles
**Table: `mother_profiles`**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK) | → users.id |
| full_name | TEXT | |
| birthdate | DATE | |
| created_at | TIMESTAMP | |

#### 4. Mother Booklets
**Table: `mother_booklets`**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | |
| mother_id | UUID (FK) | → mother_profiles.id, Indexed |
| label | TEXT | e.g., "Pregnancy 2026" |
| status | ENUM | active, archived |
| created_at | TIMESTAMP | |

#### 5. Access Control
**Table: `booklet_access`**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | |
| booklet_id | UUID (FK) | → mother_booklets.id, Indexed |
| doctor_id | UUID (FK) | → doctor_profiles.id, Indexed |
| granted_at | TIMESTAMP | |
| revoked_at | TIMESTAMP | (nullable) Soft revoke |

**Rules:**
- `(booklet_id, doctor_id)` must be unique
- Access is valid only when `revoked_at IS NULL`

#### 6. Medical Entries
**Table: `medical_entries`**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | |
| booklet_id | UUID (FK) | → mother_booklets.id, Indexed |
| doctor_id | UUID (FK) | → doctor_profiles.id |
| entry_type | ENUM | checkup, instruction, ultrasound |
| notes | TEXT | Voice-to-text output |
| visit_date | DATE | Defaults to entry creation date |
| created_at | TIMESTAMP | |

#### 7. Lab Requests
**Table: `lab_requests`**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | |
| medical_entry_id | UUID (FK) | → medical_entries.id, Indexed |
| booklet_id | UUID (FK) | → mother_booklets.id, Indexed (denormalized) |
| description | TEXT | |
| status | ENUM | pending, completed |
| created_at | TIMESTAMP | |

#### 8. Medications
**Table: `medications`**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | |
| medical_entry_id | UUID (FK) | → medical_entries.id, Indexed |
| booklet_id | UUID (FK) | → mother_booklets.id, Indexed (denormalized) |
| created_by_doctor_id | UUID (FK) | → doctor_profiles.id |
| name | TEXT | |
| dosage | TEXT | e.g., "500mg" |
| instructions | TEXT | e.g., "after meals" |
| start_date | DATE | (nullable) |
| end_date | DATE | (nullable) |
| frequency_per_day | SMALLINT | e.g., 2 |
| times_of_day | JSONB | (nullable) Optional MVP |
| is_active | BOOLEAN | Default true |
| created_at | TIMESTAMP | |

#### 9. Medication Intake Logs
**Table: `medication_intake_logs`**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | |
| medication_id | UUID (FK) | → medications.id, Indexed |
| medical_entry_id | UUID (FK) | → medical_entries.id, Indexed |
| booklet_id | UUID (FK) | → mother_booklets.id, Indexed |
| taken_date | DATE | |
| dose_index | SMALLINT | 1..frequency_per_day |
| status | ENUM | taken, missed, skipped |
| taken_at | TIMESTAMP | (nullable) |
| recorded_by_user_id | UUID (FK) | → users.id |
| created_at | TIMESTAMP | |

**Constraints:**
- Unique: `(medication_id, taken_date, dose_index)`

#### 10. QR Codes
**Table: `qr_tokens`**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | |
| booklet_id | UUID (FK) | → mother_booklets.id |
| expires_at | TIMESTAMP | |
| used_at | TIMESTAMP | (nullable) |

#### 11. Audit Log (Recommended)
**Table: `audit_events`**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID (PK) | |
| actor_user_id | UUID | |
| booklet_id | UUID | |
| action | TEXT | e.g., ADD_ENTRY, REVOKE_ACCESS |
| created_at | TIMESTAMP | |

---

## Appendix B: QR Code Specification

### QR Code Data Structure
```json
{
  "booklet_id": "uuid-string",
  "mother_id": "uuid-string",
  "expires_at": "ISO-8601-timestamp",
  "signature": "cryptographic-signature"
}
```

### QR Code Generation Process
1. Mother selects booklet
2. System generates time-limited token (default: 10 minutes)
3. Token is signed with server secret
4. QR code is generated and displayed
5. Token is stored in `qr_tokens` table

### QR Code Validation Process
1. Doctor scans QR code
2. System decodes QR data
3. System validates:
   - Token exists in database
   - Token has not expired
   - Signature is valid
4. System creates `booklet_access` record
5. System marks token as used (optional)

### Security Considerations
- Use strong cryptographic signatures
- Rotate signing keys periodically
- Rate-limit QR generation per booklet
- Log all QR scans for audit trail

---

## Appendix C: Voice-to-Text Requirements

### Supported Languages
- English
- Filipino (Tagalog)

### Medical Terminology Support
- OB-GYN specific terms
- Common medication names
- Lab test terminology
- Anatomical terms

### Implementation Requirements
- Real-time transcription
- Manual correction capability
- Save draft functionality
- Minimum 90% accuracy for common terms

### Technical Considerations
- Use cloud-based STT service (e.g., Google Speech-to-Text)
- Implement custom vocabulary for medical terms
- Provide text editing interface
- Cache successful transcriptions for training

---

## Appendix D: Notification Specifications

### Notification Types

**1. Appointment Reminders**
- Trigger: 24 hours before appointment
- Content: "Reminder: You have an appointment with Dr. [Name] tomorrow at [Time]"
- Action: Open booklet

**2. Medication Reminders**
- Trigger: Based on `times_of_day` from medication record
- Content: "Time to take [Medication Name] - [Dosage]"
- Action: Log medication intake

**3. Lab Follow-ups**
- Trigger: When lab request status changes to "completed"
- Content: "Lab results are ready. Check your booklet for details."
- Action: Open booklet

### Notification Delivery
- Push notifications (iOS/Android)
- In-app notification center
- Email notifications (optional, post-MVP)

### User Preferences
- Enable/disable per notification type
- Set preferred notification times
- Snooze functionality

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Product Team | Initial PRD |
| 1.1 | Jan 2026 | Product Team | Merged user flows, edge cases, and data model |

---

## Next Steps

### Phase 1: Sample Data MVP (Current Focus)

1. **Design Phase:**
   - Create wireframes for key flows
   - Design component library
   - Define brand guidelines
   - Design sample data structure matching database schema

2. **Technical Setup:**
   - Initialize React Native project
   - Configure AsyncStorage for local data persistence
   - Set up sample data generators
   - Configure development environment (iOS/Android)

3. **Development Sprint Planning:**
   - Break down features into Linear tickets
   - Implement sample data layer (mock services)
   - Build UI components with sample data
   - Implement QR code generation/scanning (local validation)
   - Add voice-to-text functionality (if API available)
   - Implement local notifications

4. **Testing Strategy:**
   - Define test cases for each user flow
   - Test with sample data across different scenarios
   - User testing with prototype (no backend required)
   - Gather feedback on UI/UX
   - Validate data model with real use cases

### Phase 2: Server Integration (Future)

1. **Backend Development:**
   - Set up PostgreSQL database
   - Implement REST API (Node.js + Express)
   - Configure authentication service (JWT)
   - Create database migrations
   - Implement API endpoints per specification (Section 15.6)

2. **Mobile App Updates:**
   - Replace sample data services with API calls
   - Implement network error handling
   - Add data synchronization logic
   - Implement offline support
   - Add loading states and optimistic updates

3. **Security & Compliance:**
   - Security audit
   - Penetration testing
   - PH Data Privacy Act compliance review
   - Implement encryption at rest and in transit
   - Set up audit logging

4. **Deployment:**
   - Set up staging environment
   - Configure CI/CD pipeline
   - Plan data migration from sample to production
   - Beta testing with real doctors and mothers
   - App store submissions (iOS/Android)

---

**Status: Ready for Design & Engineering Breakdown**
