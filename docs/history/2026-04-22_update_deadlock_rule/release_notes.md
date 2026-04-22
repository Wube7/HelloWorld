# Release Notes: Keynesian Beauty Contest Deadlock Reform

We're excited to rollout a strategic update to the **Keynesian Beauty Contest**, refining how and when the controversial "Deadlock Rule" comes into play! 

## 🚀 What's New
- **Fairer Tying:** We've overhauled the round resolution algorithm. If a round results in a **mathematically perfect tie** (where every active participant achieves the exact same closest distance to the target, whether picking the exact same number or coordinating equidistant splits like `100` and `0`), **nobody loses a point**. 
- **Strategic Evolution (Deadlock trigger):** To prevent continuous stalling tactics, successfully pulling off a flawless tie now acts as a trigger! As soon as a tie is achieved, the **Deadlock Rule** is permanently activated for all future rounds in that game.
- **Improved UI Transparency:** We added a specialized result banner. When the Deadlock Rule is officially triggered by a tie, players are immediately notified via a bold alert: *"⚠️ Deadlock! Everyone tied! No one lost a point, but the Deadlock Rule activates next round!"*

## 💡 Why We Made This Change
Previously, the Deadlock rule solely activated if `0` ever won a round. Under the new logic, the game respects perfect mathematical equilibrium and coordinates a "grace round" point-save for ties. It transforms the Deadlock rule into an organic consequence of the players' actions rather than an arbitrary punishment!

**Issue Resolved:** Closes [#18](https://github.com/Wube7/HelloWorld/issues/18) 
