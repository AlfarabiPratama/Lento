# Phase 2 Quick Testing Reference

## 🚀 Quick Start

### 1. Open Production App
```
https://lento-flame.vercel.app
```

### 2. Create Test Data (via Console)

**Option A: Use Helper HTML**
1. Open `scripts/create-test-data.html` in browser
2. Click buttons to create test data
3. OR copy functions to production app console

**Option B: Direct Console Commands**
```javascript
// 1. Create goal with 7-day deadline
const db = await indexedDB.open('lento_db', 1);
// ... (see create-test-data.html for full code)

// 2. Create reading sessions for streak
// ... (see create-test-data.html for full code)
```

### 3. Trigger Cron Jobs

**Vercel Dashboard:**
1. Go to: https://vercel.com/alfarabi-pratamas-projects/lento
2. Click **Settings** → **Cron Jobs**
3. Find cron to trigger:
   - `sendGoalReminders` (10:00 UTC / 17:00 WIB)
   - `sendReadingStreakReminders` (20:00 UTC / 03:00 WIB)
4. Click **"▶ Trigger"** button
5. Wait 30-60 seconds for notification

---

## 📋 Test Scenarios

### Scenario 1: Goal 7-Day Reminder
- **Setup:** Create goal with deadline = Today + 7 days
- **Trigger:** `sendGoalReminders` cron
- **Expected:** Notification "1 Minggu Lagi! 💪"
- **Deep Link:** `/goals?goalId=xyz`

### Scenario 2: Goal 3-Day Reminder
- **Setup:** Create goal with deadline = Today + 3 days
- **Trigger:** `sendGoalReminders` cron
- **Expected:** Notification "3 Hari Lagi! 🎯"
- **Deep Link:** `/goals?goalId=xyz`

### Scenario 3: Goal 1-Day Reminder
- **Setup:** Create goal with deadline = Today + 1 day
- **Trigger:** `sendGoalReminders` cron
- **Expected:** Notification "Besok Deadline! 🏁"
- **Deep Link:** `/goals?goalId=xyz`

### Scenario 4: Reading Streak Encouragement
- **Setup:** Log reading for 3 consecutive days
- **Trigger:** `sendReadingStreakReminders` cron (on Day 4)
- **Expected:** Notification "3 Hari Streak! Jangan sampai putus ya!"
- **Deep Link:** `/books`

### Scenario 5: Reading Streak Milestone (7 Days)
- **Setup:** Log reading for 7 consecutive days
- **Trigger:** `sendReadingStreakReminders` cron (on Day 8)
- **Expected:** Notification "🎉 Seminggu Streak! 7 hari berturut-turut! 🔥"
- **Deep Link:** `/books`

### Scenario 6: Reading Streak Re-engagement
- **Setup:** Have 3-day streak, then skip Day 4
- **Trigger:** `sendReadingStreakReminders` cron (on Day 5)
- **Expected:** Notification "📚 Kangen Baca? Kemarin kamu skip baca."
- **Deep Link:** `/books`

---

## ⚙️ Settings Tests

### Test Master Toggles
1. Open: Settings → Tampilan → Notifikasi
2. Toggle OFF "Target & Goal"
3. Create goal with deadline in 7 days
4. Trigger cron
5. **Expected:** No notification sent

### Test Granular Toggles
1. Toggle OFF "7 hari sebelumnya" only
2. Keep "3 hari" and "1 hari" ON
3. Create goals with all 3 deadlines
4. Trigger cron
5. **Expected:** Only 3-day and 1-day notifications sent

### Test Quiet Hours
1. Enable quiet hours: 22:00 - 08:00
2. Trigger cron at 01:00 WIB (during quiet hours)
3. **Expected:** No notifications sent
4. Check Firebase notificationLogs → status = `skipped_quiet_hours`

---

## 📊 Verification Checklist

### After Each Test:
- [ ] Notification received on device
- [ ] Message text matches expected template
- [ ] Click notification → routes to correct page
- [ ] Deep linking works (goalId param, tab selection)
- [ ] Check Settings → Notif Metrics → New log entry
- [ ] Check browser console → No errors

### Firebase Verification:
```
Firestore Console:
- users/{uid}/notificationLogs → Check latest entry
- notification_settings → Verify toggle states
- users/{uid}/goals → Verify test goals exist
- users/{uid}/book_sessions → Verify streak sessions exist
```

### Vercel Logs:
```
https://vercel.com/alfarabi-pratamas-projects/lento/logs

Filter by:
- Function: sendGoalReminders
- Function: sendReadingStreakReminders
- Status: Success / Error
```

---

## 🐛 Troubleshooting

### Issue: No Notification Received

**Check 1: FCM Token**
```javascript
// In browser console:
localStorage.getItem('fcmToken')
// Should return: "xxx...xxx" (long token)
```

**Check 2: Notification Permission**
```javascript
Notification.permission
// Should return: "granted"
```

**Check 3: Settings Enabled**
- Settings → Notifikasi → Goal Reminders = ON
- Settings → Notifikasi → Reading Streak = ON

**Check 4: Quiet Hours**
- Check if current time is in quiet hours range
- Temporarily disable quiet hours for testing

**Check 5: Vercel Logs**
- Check if cron executed successfully
- Look for error messages in function logs

### Issue: Notification Received but Wrong Message

**Check 1: Test Data**
```javascript
// Verify goal deadline is correct
const db = await indexedDB.open('lento_db', 1);
const tx = db.transaction('goals', 'readonly');
const goals = await tx.objectStore('goals').getAll();
console.log(goals);
```

**Check 2: Days Until Calculation**
- Manually calculate days between today and deadline
- Should match 7, 3, or 1 day exactly

### Issue: Deep Linking Not Working

**Check 1: Service Worker**
```javascript
navigator.serviceWorker.getRegistration()
  .then(reg => console.log('SW registered:', reg))
```

**Check 2: Notification Payload**
- Check Vercel logs → API response
- Verify `data.goalId` or `data.type` is present

**Check 3: Firebase Messaging SW**
- Check `public/firebase-messaging-sw.js` deployed
- Test in incognito (fresh SW cache)

---

## 📈 Success Metrics

### Phase 2 Testing Complete When:
- ✅ All 3 goal milestone types tested (7/3/1 day)
- ✅ All 3 reading streak types tested (encouragement/milestone/re-engagement)
- ✅ Settings control verified (master + granular toggles)
- ✅ Quiet hours functionality confirmed
- ✅ Deep linking works for all notification types
- ✅ Metrics dashboard shows all new notification types
- ✅ No console errors or warnings
- ✅ Production app stable after deployment

---

## 🔗 Quick Links

- **Production:** https://lento-flame.vercel.app
- **Vercel Dashboard:** https://vercel.com/alfarabi-pratamas-projects/lento
- **Firebase Console:** https://console.firebase.google.com
- **Documentation:** [docs/phase2-goal-reading-reminders.md](./phase2-goal-reading-reminders.md)
- **Full Testing Guide:** [docs/phase2-testing-guide.md](./phase2-testing-guide.md)
- **Test Data Helper:** [scripts/create-test-data.html](../scripts/create-test-data.html)

---

**Last Updated:** January 21, 2026  
**Phase:** 2 (Goal Milestones & Reading Streaks)  
**Status:** ✅ Deployed to Production
