# Phase 2 Testing Guide - Goal & Reading Streak Reminders

## 🎯 Test Objective
Verify Phase 2 notification system works end-to-end:
1. Goal milestone detection (7, 3, 1 day before deadline)
2. Reading streak calculation and notifications
3. Settings UI controls all notification types
4. Deep linking routes to correct pages

---

## 📋 Pre-Testing Setup

### 1. Access Production App
Open: https://lento-flame.vercel.app

### 2. Ensure FCM Token Registered
- Open Settings → Tampilan → Notifikasi
- Grant notification permission if prompted
- FCM token will be automatically registered

### 3. Enable Browser Console
Press F12 → Console tab to monitor logs

---

## 🎯 Test 1: Goal Milestone Reminders

### Test Case 1A: 7-Day Reminder

**Steps:**
1. Navigate to **More → Target**
2. Click **"Tambah Target"**
3. Select **"Target Tabungan"**
4. Fill in:
   - Nama Target: `Test Goal - 7 Days`
   - Target Nominal: `1000000`
   - Deadline: **[Today + 7 days]** (use browser date picker)
5. Click **"Simpan"**
6. Verify goal appears in Goals list

**Expected Behavior:**
- Goal saved successfully
- Shows in active goals
- Deadline displays correctly

**Manual Trigger (Vercel Dashboard):**
1. Go to: https://vercel.com/alfarabi-pratamas-projects/lento
2. Navigate to **Settings → Cron Jobs**
3. Find `sendGoalReminders` (10:00 UTC)
4. Click **"Trigger"** button
5. Wait 30-60 seconds

**Expected Notification:**
```
Title: Test Goal - 7 Days - 1 Minggu Lagi!
Body: Tetap semangat! Test Goal - 7 Days akan jatuh tempo dalam 7 hari. Kamu bisa mencapainya! 💪
Action: Click → Routes to /goals
```

**Verification:**
- [ ] Notification received on device
- [ ] Click notification → Opens /goals page
- [ ] Goal highlighted (if goalId param present)
- [ ] Check Settings → Notif Metrics → New log entry for "Target Goal"

---

### Test Case 1B: 3-Day Reminder

**Steps:**
1. Create new goal with deadline: **[Today + 3 days]**
2. Name: `Test Goal - 3 Days`
3. Trigger `/api/sendGoalReminders` manually

**Expected Notification:**
```
Title: Test Goal - 3 Days - 3 Hari Lagi!
Body: Waktu tinggal 3 hari untuk Test Goal - 3 Days. Sprint terakhir, kamu pasti bisa! 🎯
```

**Verification:**
- [ ] Notification received
- [ ] Message mentions "3 hari"
- [ ] Motivational tone appropriate

---

### Test Case 1C: 1-Day Reminder

**Steps:**
1. Create goal with deadline: **[Today + 1 day]**
2. Name: `Test Goal - Tomorrow`
3. Trigger cron manually

**Expected Notification:**
```
Title: Test Goal - Tomorrow - Besok Deadline!
Body: Test Goal - Tomorrow akan jatuh tempo besok. Ayo selesaikan dengan baik! 🏁
```

**Verification:**
- [ ] Notification received
- [ ] Message mentions "besok"
- [ ] Urgency conveyed

---

### Test Case 1D: Settings Control

**Test Disable 7-Day Reminder:**
1. Go to Settings → Tampilan → Notifikasi
2. Expand **"Target & Goal"** section
3. Toggle OFF **"7 hari sebelumnya"**
4. Create goal with deadline in 7 days
5. Trigger cron

**Expected Behavior:**
- [ ] No notification sent for 7-day goal
- [ ] 3-day and 1-day reminders still work

**Test Master Toggle:**
1. Toggle OFF **"Target & Goal"** master switch
2. Trigger cron with active goals

**Expected Behavior:**
- [ ] No goal notifications sent at all
- [ ] Other notification types still work

---

### Test Case 1E: Quiet Hours

**Steps:**
1. Set quiet hours: 22:00 - 08:00
2. Trigger cron during quiet hours (e.g., 01:00 WIB)

**Expected Behavior:**
- [ ] Notifications queued but not sent
- [ ] Check Firebase Console → notificationLogs for `skipped_quiet_hours` status

---

## 📚 Test 2: Reading Streak Reminders

### Test Case 2A: Encouragement Notification (3+ Day Streak)

**Steps:**
1. Navigate to **Books** page
2. Add a book or select existing
3. Log reading sessions:
   - Day 1: Log reading (any pages/minutes)
   - Day 2: Log reading
   - Day 3: Log reading
4. Wait until next day (Day 4)
5. Trigger `/api/sendReadingStreakReminders` manually

**How to Log Reading Session:**
- Click on book card
- Click **"+ Log Sesi Baca"** or similar
- Enter pages/minutes read
- Ensure dayKey = current date (YYYY-MM-DD)

**Expected Notification:**
```
Title: 3 Hari Streak!
Body: Kamu sudah baca 3 hari berturut-turut! Jangan sampai putus ya!
Action: Click → Routes to /books
```

**Verification:**
- [ ] Notification received on Day 4
- [ ] Streak count matches (3 days)
- [ ] Click notification → Opens /books page

---

### Test Case 2B: Milestone Notification (7 Days)

**Steps:**
1. Log reading for 7 consecutive days
2. On Day 8, trigger cron

**Expected Notification:**
```
Title: 🎉 Seminggu Streak!
Body: 7 hari berturut-turut! Kamu luar biasa. Pertahankan momentum ini! 🔥
```

**Verification:**
- [ ] Celebration emoji included
- [ ] Message mentions "7 hari"
- [ ] Notification logged as `reading_streak` type with `milestone` subtype

---

### Test Case 2C: Re-engagement (Broken Streak)

**Steps:**
1. Log reading for 3 consecutive days
2. Skip Day 4 (don't log any session)
3. On Day 5, trigger cron (streak is now broken)

**Expected Notification:**
```
Title: 📚 Kangen Baca?
Body: Kemarin kamu skip baca. Yuk mulai lagi hari ini! Streak baru dimulai dari sekarang.
```

**Verification:**
- [ ] Re-engagement message received
- [ ] Gentle tone (no shame/guilt)
- [ ] Encourages fresh start

---

### Test Case 2D: Settings Control

**Test Disable Milestones:**
1. Go to Settings → Notifikasi
2. Expand **"Reading Streak"** section
3. Toggle OFF **"Pencapaian milestone"**
4. Create 7-day streak
5. Trigger cron on Day 8

**Expected Behavior:**
- [ ] No milestone notification sent
- [ ] Encouragement notification still sent (if enabled)

**Test Master Toggle:**
1. Toggle OFF **"Reading Streak"** master switch
2. Trigger cron with active streak

**Expected Behavior:**
- [ ] No reading streak notifications sent
- [ ] Other notification types still work

---

## ⚙️ Test 3: Settings UI

### Test Case 3A: Initial State

**Steps:**
1. Open Settings → Tampilan → Notifikasi
2. Observe default state

**Expected State:**
```
✅ Tagihan (billReminders.enabled = true)
  ✅ 3 hari sebelumnya
  ✅ 1 hari sebelumnya

✅ Target & Goal (goalReminders.enabled = true)
  ✅ 7 hari sebelumnya
  ✅ 3 hari sebelumnya
  ✅ 1 hari sebelumnya

✅ Reading Streak (readingStreakReminders.enabled = true)
  ✅ Dorongan (3+ hari streak)
  ✅ Pencapaian milestone
  ✅ Re-engagement

✅ Quiet Hours (quietHours.enabled = false)
```

**Verification:**
- [ ] All sections visible
- [ ] Icons display correctly
- [ ] Toggle states match default settings
- [ ] No console errors

---

### Test Case 3B: Toggle Interactions

**Test Master Toggle:**
1. Click **"Target & Goal"** master toggle
2. Observe granular toggles

**Expected Behavior:**
- [ ] Master toggle OFF → All granular toggles disabled (greyed out)
- [ ] Master toggle ON → Granular toggles enabled again

**Test Individual Toggle:**
1. Keep master toggle ON
2. Toggle OFF **"7 hari sebelumnya"**

**Expected Behavior:**
- [ ] Only that specific toggle changes
- [ ] Master toggle stays ON
- [ ] Other granular toggles unchanged

---

### Test Case 3C: Persistence

**Steps:**
1. Change multiple settings:
   - Disable goal 7-day reminder
   - Enable quiet hours (22:00 - 08:00)
   - Disable reading streak encouragement
2. Refresh page (F5)
3. Check settings again

**Expected Behavior:**
- [ ] All changes persisted
- [ ] Settings match last saved state
- [ ] No Firestore errors in console

---

### Test Case 3D: Quiet Hours Configuration

**Steps:**
1. Toggle ON **"Quiet Hours"**
2. Set Start Time: `22:00`
3. Set End Time: `08:00`
4. Save changes

**Expected Behavior:**
- [ ] Time pickers work
- [ ] Settings saved to Firestore
- [ ] Quiet hours respected by all notification types

**Test Overnight Range:**
- Start: 22:00, End: 08:00 (crosses midnight)
- Verify: 23:00 is in quiet hours
- Verify: 07:00 is in quiet hours
- Verify: 10:00 is NOT in quiet hours

---

## 📊 Test 4: Notification Metrics

### Test Case 4A: Metrics Dashboard

**Steps:**
1. After sending test notifications, go to Settings → Notif Metrics
2. Observe dashboard

**Expected Data:**
```
Notification Type | Sent | Opened | Dismissed | Action Taken
----------------- | ---- | ------ | --------- | ------------
Target Goal       |  3   |   2    |     1     |      2
Reading Streak    |  2   |   1    |     0     |      1
Tagihan           |  0   |   0    |     0     |      0
```

**Verification:**
- [ ] Goal milestone notifications logged as "Target Goal"
- [ ] Reading streak notifications logged as "Reading Streak"
- [ ] Counts accurate
- [ ] Click events tracked when user clicks notification

---

### Test Case 4B: Deep Linking Analytics

**Steps:**
1. Click goal milestone notification
2. Check if goalId query param present
3. Verify route: `/goals?goalId=xyz123`

**Expected Behavior:**
- [ ] URL includes goalId parameter
- [ ] Goal highlighted or focused on page
- [ ] Click event logged in notificationLogs

---

## 🐛 Common Issues & Solutions

### Issue 1: No Notification Received

**Possible Causes:**
- FCM token not registered → Check Settings, grant permission
- Settings disabled → Verify master toggle ON
- Quiet hours active → Check time settings
- Invalid FCM token → Check Firebase Console logs

**Debug Steps:**
1. Open browser console
2. Check for FCM token: `localStorage.getItem('fcmToken')`
3. Verify Firestore: `notification_settings` document exists
4. Check Vercel logs: https://vercel.com/alfarabi-pratamas-projects/lento/logs

---

### Issue 2: Streak Calculation Wrong

**Possible Causes:**
- book_sessions not synced to Firestore
- dayKey format incorrect (should be YYYY-MM-DD)
- Multiple sessions in one day (only counts as 1 day)

**Debug Steps:**
1. Open Firebase Console
2. Navigate to Firestore → users/{uid}/book_sessions
3. Verify dayKey values are consecutive
4. Check occurredAt timestamps

---

### Issue 3: Deep Linking Not Working

**Possible Causes:**
- Service worker not registered
- Notification data missing goalId
- Route handler not updated

**Debug Steps:**
1. Check `public/firebase-messaging-sw.js` deployed
2. Verify notification payload includes metadata
3. Test in incognito mode (fresh service worker)

---

## ✅ Success Criteria

### Phase 2 Complete When:
- [ ] All 3 goal reminder types work (7/3/1 day)
- [ ] All 3 reading streak types work (encouragement/milestone/re-engagement)
- [ ] Settings UI controls all notifications
- [ ] Deep linking routes correctly
- [ ] Quiet hours respected
- [ ] Metrics dashboard tracks all types
- [ ] No console errors
- [ ] Production deployment stable

---

## 📈 Next Steps After Testing

1. **Monitor Production Metrics**
   - Check Vercel cron execution logs daily
   - Track notification delivery rates
   - Monitor user engagement (open/click rates)

2. **Gather User Feedback**
   - Is notification timing optimal?
   - Are messages motivational enough?
   - Any notification fatigue?

3. **Iterate on Messaging**
   - A/B test different message tones
   - Add more milestone celebrations
   - Personalize based on user behavior

4. **Phase 3 Planning**
   - Habit streak milestones
   - Custom user reminders
   - Smart notification timing (ML-based)

---

**Testing Date:** January 21, 2026  
**Tested By:** [Your Name]  
**Production URL:** https://lento-flame.vercel.app  
**Documentation:** [phase2-goal-reading-reminders.md](./phase2-goal-reading-reminders.md)
