# “Hot‑Potato Toast” Mechanic – Updated Feature Request

---

## Overview
Add a **single toast object** that alternates ownership between the two toaster players during gameplay.  
*Player 1* begins every round holding the toast. While a player owns it, the toast sits visibly on top of the toaster and a **count‑down timer** (upper‑left corner of the screen) shows the seconds remaining until ejection. When the timer hits 0, the toast is launched upward, inheriting the owner’s horizontal velocity. Only the *other* player may catch and equip it next. If the toast touches the ground, the mechanic **resets** and the toast re‑spawns on *Player 1*.

---

## 1 · Constants (tweakable via Tweakpane/dat.GUI)

| Name | Default | Purpose |
|------|---------|---------|
| `TIME_TO_EJECT` | **3.0 s** | Seconds a player may hold the toast before auto‑eject. |
| `EJECT_IMPULSE_Y` | **450 px/s** | Upward velocity applied on toast launch. |
| `toastOffsetY` | **8 px** | Vertical offset of toast sprite above owner. |

*Feel free to adjust baseline numbers during tuning.*

---

## 2 · State Flow

| Phase | Actions |
|-------|---------|
| **Spawn / Equip (start & after ground‑reset)** | • Toast is instantiated and **pinned** to *Player 1*. <br>• Physics body disabled, gravity off. <br>• Start countdown: `remaining = TIME_TO_EJECT`. |
| **Countdown (visible UI)** | • Every frame, subtract `delta`. <br>• Update on‑screen label: `Toast Launch in: {remaining.toFixed(1)}`. |
| **Ejection** | • When `remaining <= 0`: <br>  1. Enable physics body & gravity. <br>  2. Position at `owner.x, owner.y − toastOffsetY`. <br>  3. `body.setVelocityX(owner.body.velocity.x);` <br>  4. `body.setVelocityY(−EJECT_IMPULSE_Y);` <br>  5. Clear `currentOwner`. |
| **Mid‑air State** | • Toast is now a free dynamic body. <br>• **Collider**: toast ↔ ground → `handleGroundHit()`. <br>• **Overlap**: toast ↔ *other* player → `handlePickup(other)`. |
| **Pickup** | • Disable toast body & gravity. <br>• Pin to `otherPlayer`. <br>• Set `currentOwner = otherPlayer`. <br>• Reset `remaining = TIME_TO_EJECT`. |
| **Ground Hit** | • On collision with any ground tile or Y‑world‑bounds: <br>  1. Destroy or hide current toast. <br>  2. Spawn a fresh toast on *Player 1* (same as initial phase). |

> **Strict alternation rule**: the owner that just ejected the toast **cannot** re‑catch it until the other player has possessed—and subsequently ejected—it.

---

## 3 · Timer Display

```js
// Scene.create()
this.toastTimerText = this.add.text(16, 16, '', {
  font: '16px monospace',
  color: '#ffffff',
  stroke: '#000000',
  strokeThickness: 3
}).setScrollFactor(0);   // fixed to camera
```

```js
// Scene.update(time, delta)
if (currentOwner) {
  remaining -= delta / 1000;
  this.toastTimerText.setText(`Toast Launch in: ${remaining.toFixed(1)} s`);
}
```

*Hide or clear the label if no player currently owns the toast.*

---

## 4 · Implementation Tips

* **Pinning** – in `update()`, call `toast.setPosition(owner.x, owner.y - toastOffsetY)`.  
* **Ownership Flag** – store `currentOwner` (`null | player1 | player2`) to enforce alternation.  
* **Collision Layers** – while equipped, set `toast.body.enable = false`; enable just before launch.  
* **Reset Logic** – keep a helper `spawnToastOn(player)` to centralize spawn behaviour.  
* **Visual Feedback** – optional squash‑stretch or particle burst on launch for juice (not mandatory now).  
* **Placeholder Art** – toast sprite can remain a brown rectangle until final graphics arrive.  

---

## Acceptance Criteria

- ✔️ Toast starts on **Player 1** each round/reset.  
- ✔️ Visible countdown in the upper‑left displays time remaining (updated every 0.1 s or each frame).  
- ✔️ Toast launches upward with owner’s X velocity plus `EJECT_IMPULSE_Y` when timer ends.  
- ✔️ Only the *other* player can collect the toast; ownership alternates strictly.  
- ✔️ Ground contact triggers a clean reset (no game‑over).  
- ✔️ All numeric parameters exposed in the existing GUI for live tuning.  