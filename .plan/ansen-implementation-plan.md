# ANSEN Competition Platform Implementation Plan

## Overview

Transform the existing CTF platform into a comprehensive 3-phase ANSEN competition system for Côte d'Ivoire's cybersecurity competition with:
- Individual + Team scoring system
- 5-member teams with individual accounts
- 3 competition phases (MC → Technical → Incident Response)
- Advanced judge controls (team/user management, bulk import, question bank templates)
- Custom ANSSI branding

---

## Key Requirements from Document Analysis

### Competition Structure
1. **3 Phases:**
   - Phase 1: Multiple Choice (25 min) - Individual scoring
   - Phase 2: Technical/Practical (35 min) - Individual scoring  
   - Phase 3: Incident Response (35 min) - Team collaborative scoring

2. **Team Composition:**
   - 5 members per team
   - Each member has individual account
   - Individual scores contribute to team total
   - Team shares one collaborative account for Phase 3

3. **Scoring System:**
   - Individual scores (Phase 1 + Phase 2)
   - Team collaborative score (Phase 3)
   - Final ranking combines both dimensions

4. **Question Distribution:**
   - Shared team question pool (no duplicate questions within team)
   - Dynamic question assignment
   - Difficulty levels: Easy (100pts), Medium (150pts), Hard (200pts)
   - Unlimited attempts with time penalties

### Judge Requirements
1. **Team Management:**
   - Create teams (5 members + 1 team account)
   - Bulk import via CSV/Excel
   - Individual user management
   - Reset individual/team progress

2. **Question Bank:**
   - Import question templates (Excel/CSV)
   - Question categories and difficulty
   - Multiple choice + Technical questions
   - Incident Response scenario builder

3. **Competition Control:**
   - Start/pause/stop timer
   - Phase transitions
   - Real-time monitoring
   - Export audit logs

---

## Current System Architecture

### Database Schema (SQLite)
```
users (id, username, password, role, team_name)
challenges (id, type, title, description, points, category, answer, hints, difficulty)
submissions (id, user_id, challenge_id, answer, is_correct, points_earned)
phases (id, challenge_id, phase_number, title, description, required_fields)
phase_submissions (id, user_id, challenge_id, phase_id, submission_data)
competition_settings (id, start_time, end_time, is_active)
```

### Backend (Node.js/Express)
- Routes: auth, challenges, submissions, phases, leaderboard, judge
- JWT authentication
- SQLite database

### Frontend (React/Vite)
- Pages: Login, Dashboard, Challenges, Leaderboard, Judge, IncidentResponse
- Components: CompetitionTimer, Layout, Analytics

---

## Implementation Plan

### Phase 1: Database Schema Extension

**New Tables:**
```sql
teams (
  id, 
  team_name, 
  team_code UNIQUE,
  created_at
)

team_members (
  id,
  team_id,
  user_id,
  member_number (1-5),
  is_team_account BOOLEAN,
  UNIQUE(team_id, user_id)
)

question_pool (
  id,
  team_id,
  challenge_id,
  assigned_to_user_id,
  assigned_at,
  UNIQUE(team_id, challenge_id) -- prevents duplicate questions per team
)

competition_phases (
  id,
  phase_number (1-3),
  phase_name,
  duration_minutes,
  start_time,
  end_time,
  is_active BOOLEAN
)

question_templates (
  id,
  type (mc/technical/ir),
  title,
  description,
  difficulty,
  points,
  category,
  answer,
  hints JSON,
  created_by_judge_id,
  is_active BOOLEAN
)

audit_log (
  id,
  user_id,
  challenge_id,
  action (view/submit/skip),
  attempt_number,
  answer,
  is_correct,
  points_earned,
  time_taken_seconds,
  timestamp
)
```

**Modified Tables:**
- `users`: Add fields `team_id`, `is_team_account`, `member_number`
- `challenges`: Add `phase_number`, `team_id`, `assigned_to_user_id`
- `submissions`: Add `attempt_number`, `time_taken`, `skipped`

### Phase 2: Backend API Extensions

**New Routes:**

1. **Team Management (`/api/teams`)**
   - `POST /teams/create` - Create team with 5 members + 1 team account
   - `POST /teams/import` - Bulk import from CSV/Excel
   - `GET /teams/:id` - Get team details with members
   - `PUT /teams/:id` - Update team info
   - `DELETE /teams/:id` - Delete team (cascade)
   - `GET /teams/:id/scores` - Individual + team scores breakdown

2. **Question Bank (`/api/question-bank`)**
   - `POST /upload-template` - Import questions from Excel/CSV
   - `GET /templates` - List all question templates
   - `POST /templates` - Create question manually
   - `PUT /templates/:id` - Update question
   - `DELETE /templates/:id` - Soft delete
   - `POST /templates/activate` - Activate questions for competition

3. **Competition Control (`/api/competition`)**
   - `POST /phase/start` - Start specific phase
   - `POST /phase/pause` - Pause current phase
   - `POST /phase/end` - End current phase
   - `GET /phase/status` - Get current phase status
   - `PUT /settings` - Update competition settings (already exists, enhance)

4. **Enhanced Submissions**
   - Track attempt numbers per question
   - Calculate time penalties
   - Enforce question pool logic (no duplicates within team)
   - Support "skip" functionality

5. **Audit & Export**
   - `GET /audit/team/:id` - Team audit trail
   - `GET /audit/user/:id` - User audit trail
   - `GET /export/results` - CSV export with all data

### Phase 3: Frontend Modifications

**1. Logo Replacement**
- Replace current logo with `/Users/rickbook2025/Documents/Anxinsec/Project/Côte d'Ivoire/网络安全周/anssi.png`
- Update Layout.jsx header
- Add "ANSEN - Côte d'Ivoire" branding

**2. Judge Panel Enhancements**

New sections in JudgePage:
- **Team Management Tab:**
  - Create team form (team name, 5 member accounts + 1 team account)
  - Import CSV/Excel button with preview
  - Team list with expand/collapse for members
  - Individual reset buttons per user
  - Team-wide reset button

- **Question Bank Tab:**
  - Upload template button (Excel/CSV)
  - Question template table (filter by type/difficulty/category)
  - Inline edit/delete
  - Manual question creation form
  - Activate/deactivate questions

- **Competition Control Tab** (enhance existing):
  - Phase selector (Phase 1 / Phase 2 / Phase 3)
  - Start/Pause/End buttons per phase
  - Phase countdown timer
  - Live participant count

- **Monitoring Tab:**
  - Real-time submission feed
  - Team progress matrix (heatmap)
  - Question distribution visualization
  - Export audit log button

**3. Leaderboard Enhancements**

Add dual-ranking system:
- **Individual Leaderboard** (Phase 1 + Phase 2 scores)
- **Team Leaderboard** (Sum of individual + Phase 3 collaborative)
- Toggle tabs between views
- Show breakdown: MC + Technical + IR scores

**4. Player Experience**

- **Phase Indicators:** Show which phase is active
- **Question Assignment:** Auto-assign from team pool (no duplicates)
- **Attempt Counter:** Display current attempt number
- **Skip Button:** Allow skipping questions with tracking
- **Time Tracking:** Per-question timer
- **Team Collaboration Mode:** Special UI for Phase 3 (all 5 members see same incident)

### Phase 4: Question Import Templates

**CSV/Excel Format:**
```
Type, Title, Description, Difficulty, Points, Category, Answer, Hint1, Hint2, Hint3, Hint4
multiple_choice, "Basic Defense", "Which command...", easy, 100, "Linux", "B", "ls", "ps", "top", "netstat"
technical, "Log Analysis", "Find the attacker IP...", medium, 150, "Forensics", "192.168.1.100", "Check auth.log", "Look for failed attempts", "", ""
```

**Import Logic:**
- Parse CSV/Excel
- Validate required fields
- Preview before import
- Bulk insert into `question_templates`
- Activate selected questions

### Phase 5: Team Creation & Import

**Manual Team Creation Form:**
```
Team Name: _____________
Member 1 Username: _______ Password: _______
Member 2 Username: _______ Password: _______
Member 3 Username: _______ Password: _______
Member 4 Username: _______ Password: _______
Member 5 Username: _______ Password: _______
Team Account Username: _______ Password: _______
```

**Bulk Import CSV Format:**
```
TeamName, Member1User, Member1Pass, Member2User, Member2Pass, ..., TeamUser, TeamPass
Alpha, user1, pass1, user2, pass2, user3, pass3, user4, pass4, user5, pass5, team_alpha, teampass1
Beta, user6, pass6, user7, pass7, user8, pass8, user9, pass9, user10, pass10, team_beta, teampass2
```

---

## Implementation Sequence

### Sprint 1: Foundation (Days 1-2)
1. ✅ Replace logo with ANSSI branding
2. ✅ Extend database schema (new tables + migrations)
3. ✅ Create team management backend routes
4. ✅ Build team creation UI (manual form)

### Sprint 2: Question Bank (Days 3-4)
1. ✅ Question template schema
2. ✅ CSV/Excel parser backend
3. ✅ Question bank UI (upload, list, edit)
4. ✅ Question activation logic

### Sprint 3: Competition Control (Days 5-6)
1. ✅ Phase management backend (start/pause/end)
2. ✅ Phase timer enhancements
3. ✅ Competition control panel UI
4. ✅ Question pool distribution logic

### Sprint 4: Scoring & Leaderboard (Days 7-8)
1. ✅ Dual scoring system (individual + team)
2. ✅ Attempt tracking and penalties
3. ✅ Enhanced leaderboard UI (tabs)
4. ✅ Real-time score updates

### Sprint 5: Monitoring & Export (Days 9-10)
1. ✅ Audit log implementation
2. ✅ Real-time monitoring dashboard
3. ✅ CSV export functionality
4. ✅ Bulk team import
5. ✅ Final testing & refinement

---

## Technical Considerations

### Question Pool Logic
```javascript
// When user requests a question:
1. Check team's question_pool table
2. Find unassigned questions of correct type/difficulty
3. Assign to user (INSERT into question_pool)
4. Return question
5. Prevent other team members from getting same question
```

### Attempt Tracking
```javascript
// On submission:
1. Count existing attempts for this user+challenge
2. Increment attempt_number
3. Calculate time_taken from question assignment
4. Apply time penalty if attempt > 1
5. Log to audit_log
```

### Phase Transitions
```javascript
// Judge triggers phase change:
1. End current phase (set end_time)
2. Calculate final scores for phase
3. Start next phase (set start_time, is_active=true)
4. Broadcast to all clients via WebSocket (or polling)
5. Reset timers
```

---

## Risk Mitigation

1. **Question Duplication:** Enforce UNIQUE constraint on (team_id, challenge_id) in question_pool
2. **Concurrent Submissions:** Use database transactions for score updates
3. **Timer Synchronization:** Use server time, not client time
4. **Data Loss:** Implement auto-save for judge configurations
5. **Import Validation:** Strict CSV parsing with error messages

---

## Testing Strategy

1. **Unit Tests:** Question assignment logic, scoring calculations
2. **Integration Tests:** Team creation, question import, phase transitions
3. **E2E Tests:** Complete competition flow (3 phases)
4. **Load Testing:** Simulate 50 teams (250 users) concurrent access
5. **Judge Workflow:** Test all admin operations

---

## Deployment Checklist

- [ ] Logo replaced with ANSSI branding
- [ ] Database migrations applied
- [ ] Team management functional
- [ ] Question bank import working
- [ ] CSV templates documented
- [ ] Competition phases controllable
- [ ] Dual leaderboard operational
- [ ] Audit logs exportable
- [ ] User documentation complete
- [ ] Judge training materials prepared

---

## Open Questions for User

1. **Time Penalties:** Exact formula for additional attempts? (e.g., -10% per attempt, -20 points, etc.)
2. **Skip Functionality:** Can skipped questions be re-attempted? Is there a skip limit?
3. **Phase 3 Collaboration:** Do all 5 members submit together, or is there a "team lead" who submits?
4. **Question Randomization:** Should questions be randomized within difficulty tiers, or assigned in order?
5. **Partial Credit:** For technical questions, is partial credit allowed? (e.g., 2/4 fields correct = 50 points)
6. **Incident Response Phases:** Are the existing 5 IR phases compatible with the requirements, or do they need modification?

---

## Success Criteria

- ✅ 50 teams (250 individual users + 50 team accounts) can compete simultaneously
- ✅ Judges can create teams in < 2 minutes (manual) or < 30 seconds (bulk import)
- ✅ Question bank of 100+ questions can be imported in < 1 minute
- ✅ Real-time leaderboard updates within 5 seconds of submission
- ✅ Complete audit trail for every action
- ✅ Zero question duplication within teams
- ✅ Phase transitions execute smoothly with < 2 second delay
- ✅ CSV export completes in < 10 seconds

---

## Estimated Effort

- **Database & Backend:** 30 hours
- **Frontend UI:** 25 hours  
- **Question Import:** 8 hours
- **Team Management:** 10 hours
- **Testing & Refinement:** 12 hours
- **Documentation:** 5 hours

**Total:** ~90 hours (approximately 2 weeks for 1 developer)
