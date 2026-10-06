# Security Specification

## 1. Data Invariants
- Only authenticated users can access, create, or modify their own user profile document at `/users/{userId}` where `request.auth.uid == userId`.
- Subcollections (`player_records` and `trained_experiments`) are strictly locked under `/users/{userId}/...` enforcing relational ownership: user ID in the path and `userId` field must match `request.auth.uid`.
- Creation of records must include valid timestamps matching `request.time`.
- String lengths are strictly enforced to prevent Denial of Wallet resource attacks.

## 2. The Dirty Dozen Payloads
1. Unauthenticated read on `/users/{userId}` -> PERMISSION_DENIED
2. Unauthenticated write on `/users/{userId}` -> PERMISSION_DENIED
3. User A attempting to read User B's `/users/{userB}` -> PERMISSION_DENIED
4. User A attempting to create records in User B's `/users/{userB}/player_records` -> PERMISSION_DENIED
5. Payload with spoofed `userId` different from `request.auth.uid` -> PERMISSION_DENIED
6. Document creation with oversized player name (> 120 chars) -> PERMISSION_DENIED
7. Document ID injection with special characters (e.g. `../` or junk chars) -> PERMISSION_DENIED
8. Client-side timestamp forgery during record creation (`createdAt != request.time`) -> PERMISSION_DENIED
9. Shadow field injection on UserProfile update -> PERMISSION_DENIED
10. Unauthenticated deletion on subcollection -> PERMISSION_DENIED
11. User attempting to modify another user's trained experiments -> PERMISSION_DENIED
12. Blanket list queries bypassing owner UID filter -> PERMISSION_DENIED
