# 🚀 Vercel Cron Jobs for Auto-Reminders

Automated notification system dengan Vercel Cron + Firebase Cloud Messaging.

## 📅 Schedule

| Job | Time (Jakarta) | Time (UTC) | Cron Expression | Frequency |
|-----|---------------|------------|-----------------|-----------|
| **Habit Reminders** | 8:00 AM | 1:00 AM | `0 1 * * *` | Daily |
| **Journal Reminders** | 9:00 PM | 2:00 PM | `0 14 * * *` | Daily |
| **Budget Warnings** | 12:00 PM, 6:00 PM | 5:00 AM, 11:00 AM | `0 5,11 * * *` | Twice daily |
| **Weekly Summary** | Sunday 7:00 PM | Sunday 12:00 PM | `0 12 * * 0` | Weekly |

## 🔐 Setup Environment Variables di Vercel

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add these variables:

```bash
FIREBASE_PROJECT_ID=lento-less-rush-more-rhythm
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@lento-less-rush-more-rhythm.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----"
CRON_SECRET=your-random-secret-key-here
```

### How to Get Firebase Credentials:

1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON file
4. Copy values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (paste as-is with \n)

## 🧪 Manual Testing

Test endpoints locally atau via curl:

```bash
# Test Habit Reminders
curl -X POST https://lento-less-rush-more-rhythm.vercel.app/api/sendHabitReminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test Journal Reminders
curl -X POST https://lento-less-rush-more-rhythm.vercel.app/api/sendJournalReminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test Budget Warnings
curl -X POST https://lento-less-rush-more-rhythm.vercel.app/api/checkBudgetWarnings \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test Weekly Summary
curl -X POST https://lento-less-rush-more-rhythm.vercel.app/api/sendWeeklySummary \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📊 Monitoring

Check logs di Vercel Dashboard:
- Runtime Logs → See cron execution
- Error reporting via console.log/error
- Track success/failure counts

## 🔧 Troubleshooting

### Cron tidak jalan?
- Check Vercel plan (Cron perlu Hobby/Pro plan)
- Verify `vercel.json` syntax
- Check deployment logs

### Notifications tidak terkirim?
- Verify Firebase credentials
- Check user has FCM tokens
- Test via Firebase Console first

### Timezone salah?
- Vercel Cron uses UTC
- Jakarta = UTC+7, so 8 AM Jakarta = 1 AM UTC

## 🎯 Best Practices Implemented

- ✅ **Smart Scheduling**: Random ±5 min offset untuk battery efficiency
- ✅ **Token Cleanup**: Auto-delete invalid FCM tokens
- ✅ **Security**: Vercel Cron auth + optional CRON_SECRET
- ✅ **Graceful Degradation**: Skip users without tokens
- ✅ **Rate Limiting**: Max 3 notifications/user/day (enforced by schedule)
- ✅ **Error Handling**: Try/catch per user, continue on error

## 📈 Analytics to Track

Future improvements:
- Delivery rate (success/failed)
- Open rate (click tracking)
- Opt-out rate
- Best sending times per user
