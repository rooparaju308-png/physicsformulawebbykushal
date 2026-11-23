# Security Specification: JEE Physics Web Community & Cloud Sync

## 1. Data Invariants

1. **PII Isolation**: Email addresses (`email`) reside strictly inside `/users/{userId}/private/studyData` (owner-only read/write). `/publicProfiles/{userId}` never stores emails, phone numbers, or addresses.
2. **Non-Destructive Study Persistence**: `/users/{userId}/private/studyData` forbids `delete` (`allow delete: if false`) so study progress and Gmail account data can never be erased via client deletion. Only the authenticated owner (`request.auth.uid == userId`) can read or update `studyData`.
3. **Public Profile Integrity**: A `PublicProfile` can only be created by the matching UID (`userId == request.auth.uid`), with immutable `uid`, `guestCode`, and `createdAt`, and bounded numeric counters (`focusXp` in `[0, 50000000]`). Upgrading `authType` from `'guest'` to `'gmail'` requires `request.auth.token.email_verified == true`.
4. **Community Chat Integrity**: Every `CommunityMessage` must be authored by `request.auth.uid`, match an existing `PublicProfile`, belong to one of the 5 physics channels, carry server timestamp `createdAt == request.time`, contain text or a photo (`<= 350,000` chars), and be immutable after creation (only owner may delete).
5. **1v1 Friend & DM Thread Master Gate**:
   - `DmThread` requires lexicographically ordered `participantA < participantB`, `participants == [participantA, participantB]`, `threadId == participantA + '_' + participantB`, and initial `status == 'pending'` set by `initiatedBy == request.auth.uid`.
   - Only the recipient (`initiatedBy != request.auth.uid`) can accept (`pending` -> `accepted`). Once `accepted`, status cannot revert to `pending`.
   - `DmMessage` under `/dmThreads/{threadId}/messages/{messageId}` performs a Master Gate `get()` on parent `dmThreads/{threadId}` on `get` and `create`, requiring `status == 'accepted'`, membership in `participants`, matching `participants` array, and server timestamp `createdAt == request.time`.
6. **Query Enforcer & Cost Guard**: All `allow list` rules explicitly constrain `resource.data` (no blanket `isSignedIn()` reads and no `get()`/`exists()` inside `allow list`). All document IDs match `^[a-zA-Z0-9_\-]+$` (`<= 128` chars), and all strings/lists have strict upper bounds.

## 2. The "Dirty Dozen" Attack Payloads

1. **Identity Spoofing (Community Message)**: Signed-in user `uidA` attempts `create` on `/communityMessages/m1` with `senderId: "uidB"`. -> **DENIED** (`incoming().senderId == request.auth.uid`).
2. **Shadow Field Injection (Public Profile)**: User `uidA` attempts `create` on `/publicProfiles/uidA` with extra ghost field `isVerified: true` or `role: "admin"`. -> **DENIED** (`keys().hasOnly([...])`).
3. **Email Spoof Upgrade (Public Profile)**: Anonymous guest `uidA` attempts `update` setting `authType: "gmail"` without `email_verified == true`. -> **DENIED**.
4. **Cross-User PII Read**: User `uidA` attempts `get` or `list` on `/users/uidB/private/studyData`. -> **DENIED** (`request.auth.uid == userId`, `allow list: if false`).
5. **Private Data Erasure**: User `uidA` attempts `delete` on `/users/uidA/private/studyData`. -> **DENIED** (`allow delete: if false`).
6. **ID Poisoning**: Attacker attempts `create` on `/communityMessages/<1500_char_string>` or with invalid chars `../admin`. -> **DENIED** (`isValidId(messageId)`).
7. **Timestamp Forgery**: User `uidA` submits `createdAt: "2020-01-01T00:00:00Z"` or past timestamp instead of `serverTimestamp()`. -> **DENIED** (`incoming().createdAt == request.time`).
8. **Self-Accepting Friend Request**: Initiator `uidA` creates `DmThread` with `status: "accepted"` immediately, bypassing recipient consent. -> **DENIED** (`create` requires `status == 'pending'`; `accept` requires `request.auth.uid != existing().initiatedBy`).
9. **DM Thread State Regression**: Participant attempts to change `status` from `'accepted'` back to `'pending'`. -> **DENIED** (state transition gate).
10. **Messaging in Pending/Non-Existent Thread**: User `uidA` attempts `create` on `/dmThreads/uidA_uidB/messages/msg1` while `DmThread.status == 'pending'`. -> **DENIED** (Master Gate `get()` verifies `status == 'accepted'`).
11. **Denial-of-Wallet Oversized Payload**: User attempts to write `photoDataUrl` > 350,000 bytes or `text` > 1000 chars or `knownIds` > 500 items. -> **DENIED** (`.size()` limits).
12. **Thread Hijack / Eavesdrop**: Outsider `uidC` attempts `get` or `list` on `/dmThreads/uidA_uidB` or `/dmThreads/uidA_uidB/messages`. -> **DENIED** (`request.auth.uid in participants`).
13. **Study Room Host Hijack**: Non-host `uidB` attempts `update` or `delete` on `/studyRooms/{roomId}` to pause/skip the host's timer. -> **DENIED** (`existing().hostUid == request.auth.uid`).
14. **Participant Status Spoofing / Orphan Join**: User `uidA` tries to join an inactive/non-existent study room or overwrite `uidB`'s participant badge at `/studyRooms/{roomId}/participants/uidB`. -> **DENIED** (Master Gate `get(/studyRooms/{roomId}).data.isActive == true` + `participantId == request.auth.uid`).
