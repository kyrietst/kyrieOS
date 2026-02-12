# Feature Specification: Master Capacity Guard (v2 - Liquid Capacity)

## Overview
The **Master Capacity Guard** is the logistics engine of the Kyrie Strategic Center. It implements a **Burn-down Capacity** model, where the system monitors not just what was planned, but how much "Liquid Effort" remains, crossing data from estimates and real-time tracking.

---

## 1. Data Schema & Liquid Logic

### Schema Enhancements
| Field | Type | Description |
|-------|------|-------------|
| `estimated_minutes` | `integer` | Gross estimate of the task. |
| `due_date` | `timestamptz` | Deadline (Calendar placement). |

### The "Liquid" Formula (Remaining Load)
The core of the system is the **Remaining Load (RL)** calculation:
`Remaining Load = MAX(0, estimated_minutes - tracked_minutes)`

This requires a Database View or RPC (`get_liquid_capacity`) that joins `kanban_cards` with `time_entries` to subtract already worked time from the initial estimate.

### Automatic ICE "Ease" Calculation
Remains linked to the **Initial Estimate**:
- **< 2h**: Ease = 10
- **2-4h**: Ease = 7
- **4-8h**: Ease = 3
- **> 8h**: Ease = 1

---

## 2. UI Components (Dynamic Strategic View)

### Master Calendar View (`/kyrie/workspace/calendar`)
- **Intensity Heatmap (Daily)**: Daily cells use monochromatic intensity (e.g., shades of Blue/Violet).
    - Light shade = Low load.
    - Dark shade = Busy day.
    - *Purpose:* Pure visualization of the day's "weight" without judgment.
- **Weekly Bucket (The Guard)**: A visual indicator at the start of each week showing the **Total Agency Load**.
    - 🟢 **Green (< 50h/week)**: Healthy capacity.
    - 🟡 **Yellow (50-60h/week)**: High pressure.
    - 🔴 **Red (> 60h/week)**: **Weekly Bottleneck**. Alarms triggered.

---

## 3. Capacity Agent Logic (Burn-down Aware)

The AI Agent orchestrates flows based on **Liquid Capacity**, not just static dates.

```python
def check_agency_health(target_week):
    # 1. Calculate Liquid Load
    # Sum(Remaining Load) of all active cards in the week
    weekly_liquid_load = db.query_weekly_liquid_load(target_week)
    
    # 2. Alert on Weekly Limit (e.g., 50 hours)
    if weekly_liquid_load > agency_settings.weekly_threshold:
        return "WEEKLY_BOTTLENECK_DETECTED"
    
    return "AGENCY_HEALTHY"

def suggest_slot(unscheduled_task):
    # Search for "Azul Claro" (low intensity) days 
    # and verify if the increment doesn't explode the Weekly Bucket.
```

---

## 4. Business Rules & Success Metrics

- **Burn-down Accuracy**: As the team tracks time, the "Gargalo" colors in the calendar automatically lighten up, reflecting real available time.
- **Weekly Strategy**: Planning is done week-by-week, allowing daily flexibility (Darker days are fine as long as the week isn't "Red").
- **Agent Intelligence**: IA agents will "know" that if they log time, they are specifically freeing up "Liquid Capacity" for the rest of the week.
