# Implement Atomic Transactions and Author Restrictions for Survey Ideas Votes

Resolve asynchronous voting exploits where rapid repeated clicking artificially inflates total upvote points on the ideation board, and enforce strict participant author verification to prevent self-voting.

## User Review Required
Please review the introduction of Firebase `runTransaction` for atomic server-side vote validation.

## Root Cause Analysis
In `script.js`, the upvoting mechanism previously calculated point differences (`diff`) based on client-side state snapshots before issuing separate sequential database writes to `/voters/$uid` and `/votes`. During rapid repeated clicking or high network latency, client snapshots become stale before database acknowledgments return, causing concurrent click handlers to calculate cumulative additions based on un-synchronized starting values. Furthermore, card generation loops did not verify if the active user matched the card's author (`item.uid === currentUser.uid`), allowing creators to upvote their own submissions. Migrating upvote operations to Firebase `runTransaction` ensures atomic server-side verification, guaranteeing flawless arithmetic consistency while blocking self-votes.

## Proposed Changes

### Public Assets

#### [MODIFY] [script.js](file:///usr/local/google/home/wube/.gemini/jetski/brain/9130eb8d-7df8-4400-b6f6-bbd2f10f4710/scratch/HelloWorld_GitRepo/public/script.js)
- Import `runTransaction` from Firebase Database SDK:
  ```javascript
  import { getDatabase, ref, onValue, onDisconnect, set, remove, push, serverTimestamp, onChildAdded, query, orderByChild, limitToLast, runTransaction } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';
  ```
- In `renderIdeaClientBoard`, disable upvote buttons and display self-author styling if `item.uid === currentUserUid`:
  ```javascript
  const isMyIdea = (currentUserUid && item.uid === currentUserUid);
  ...
  <button class="btn-upvote ..." ${isLocked || isMyIdea ? 'disabled' : ''} title="${isMyIdea ? 'You cannot vote for your own idea' : ''}">👍 +1</button>
  ```
- Refactor click handler to execute `runTransaction` with UI debounce locking:
  ```javascript
  let isVotingInProgress = false;
  ...
  btn.addEventListener('click', async (e) => {
      if (isLocked || !auth.currentUser || isVotingInProgress) return;
      isVotingInProgress = true;
      ...
      try {
          await runTransaction(ref(db, `admin/ideaState/ideas/${iid}`), (currentIdea) => {
              if (!currentIdea || currentIdea.uid === auth.currentUser.uid) return currentIdea;
              
              const voters = currentIdea.voters || {};
              const oldVal = voters[auth.currentUser.uid] || 0;
              let newVal = (oldVal === clickVal) ? 0 : clickVal;
              
              const diff = newVal - oldVal;
              currentIdea.votes = (currentIdea.votes || 0) + diff;
              
              if (newVal === 0) {
                  delete currentIdea.voters[auth.currentUser.uid];
              } else {
                  if (!currentIdea.voters) currentIdea.voters = {};
                  currentIdea.voters[auth.currentUser.uid] = newVal;
              }
              return currentIdea;
          });
      } catch (err) { ... } finally {
          isVotingInProgress = false;
      }
  });
  ```

## Verification Plan

### Manual Verification
- In an incognito window, log in as an anonymous ninja account (`🥷 Owl`). Submit idea: `"Dark Mode Optimization"`.
- Verify that upvote buttons on this specific card are disabled with tooltip `"You cannot vote for your own idea"`.
- In a second browser session (`🥷 Koala`), rapidly double and triple click `+2` on Owl's card. Verify total points reliably toggle between `0` and `2 pts` without inflating to 4 or 6 points.
