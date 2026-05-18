# Design Document: Cooperative Equations Game Mode (v1.0)

Introduce an immersive, zero-assist cooperative puzzle game mode where players must collaborate to solve a symmetric system of linear equations to unlock the room.

## 1. Game Mathematical Matrix

Six variables are assigned to six player roles ($A, B, C, D, E, F$).
Secret key values:
- $A = 6$
- $B = 4$
- $C = 8$
- $D = 2$
- $E = 5$
- $F = 7$
- **Final Sum (Passcode):** $A + B + C + D + E + F = 32$

### Perfectly Symmetric Equation Matrix

To create a perfect visual illusion of identical lists, every player sees exactly the same operators, constants, and syntactic structure in each slot. The *only* difference is that for the player's own role, the variables on the right-hand side are replaced by single digits to avoid any alignment shifts.

To prevent leaking the final answers, all chosen digits are strictly verified to be **different** from the variables they replace, and **different** from the solved value of that line.

| Slot | Player A (A=6) | Player B (B=4) | Player C (C=8) | Player D (D=2) | Player E (E=5) | Player F (F=7) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **$A = 5 + 3 - 2$** | $A = C + D - B$ | $A = C + D - B$ | $A = C + D - B$ | $A = C + D - B$ | $A = C + D - B$ |
| **2** | $B = D + E + 5 - C$ | **$B = 3 + 2 + 5 - 6$** | $B = D + E + 5 - C$ | $B = D + E + 5 - C$ | $B = D + E + 5 - C$ | $B = D + E + 5 - C$ |
| **3** | $C = E + F - 2 - D$ | $C = E + F - 2 - D$ | **$C = 6 + 9 - 2 - 5$** | $C = E + F - 2 - D$ | $C = E + F - 2 - D$ | $C = E + F - 2 - D$ |
| **4** | $D = F + A - 6 - E$ | $D = F + A - 6 - E$ | $D = F + A - 6 - E$ | **$D = 3 + 9 - 6 - 4$** | $D = F + A - 6 - E$ | $D = F + A - 6 - E$ |
| **5** | $E = A + B + 2 - F$ | $E = A + B + 2 - F$ | $E = A + B + 2 - F$ | $E = A + B + 2 - F$ | **$E = 7 + 2 + 2 - 6$** | $E = A + B + 2 - F$ |
| **6** | $F = B + C + 1 - A$ | $F = B + C + 1 - A$ | $F = B + C + 1 - A$ | $F = B + C + 1 - A$ | $F = B + C + 1 - A$ | **$F = 5 + 4 + 1 - 3$** |

---

## 2. Visual Illusion & UX Guidelines

To maintain the psychological illusion that all players have received identical sheets, the following visual constraints must be strictly enforced:
1. **Identical Styling**: All six equations must be rendered with identical CSS properties (font-family, font-size, font-weight, padding, margins, and colors).
2. **No Highlights**: The solvable arithmetic equation must **never** be highlighted, bolded, or colored in green or any special indicator. The player must read through the list to notice the simple equation naturally.
3. **Zero Assist Toggles**: Do not provide any automated sharing, connection widgets, or scratchpads. The interface consists purely of:
   - A clean, symmetric list of 6 equations.
   - A single passcode submission input field at the bottom: `"Enter final sum (A+B+C+D+E+F)"`.
4. **Social Cohesion**: Players are encouraged to communicate verbally or via the shared chat box to swap values and solve the systems of equations.
