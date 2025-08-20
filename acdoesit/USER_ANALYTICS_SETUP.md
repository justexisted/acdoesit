# User Analytics & Tracking Setup Guide

This guide will help you set up comprehensive user tracking and analytics for your AI Prompt Builder application.

## 🎯 What You'll Get

- **User Analytics Dashboard** with 3 tabs: Users, Engagement, and Feature Usage
- **Real-time Activity Tracking** for all user interactions
- **Location Tracking** (city, region, country)
- **Engagement Metrics** and scoring
- **Feature Usage Analytics** showing which tools are most popular
- **CSV Export** functionality for all data
- **Time Formatting** in AM/PM instead of 24-hour format

## 🗄️ Database Setup

### 1. Create Required Tables

Run the SQL commands in `database-schema.sql` in your Supabase SQL editor:

```sql
-- This will create:
-- - users table (user registration data)
-- - user_activity table (all user actions)
-- - user_analytics view (aggregated data)
-- - Proper indexes and security policies
```

### 2. Update Environment Variables

Add these to your Netlify environment variables:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_service_role_key
```

## 🔧 Implementation Steps

### Step 1: Database Tables
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Run the script

### Step 2: Netlify Functions
The following functions have been created:
- `track-user-activity.js` - Tracks user actions
- `get-user-analytics.js` - Retrieves analytics data

### Step 3: Admin Dashboard
The admin interface has been updated with:
- Statistics overview cards
- Tabbed interface (Users, Engagement, Features)
- Enhanced CSV export with proper time formatting

### Step 4: AI Prompt Builder Tracking
User activity is now tracked for:
- Page views
- Module switches
- Template selections
- Prompt generation
- Copy actions
- Save attempts

## 📊 What Gets Tracked

### User Actions
- `page_view` - When users visit pages
- `module_switch` - Switching between AI modules
- `template_selected` - Choosing different templates
- `prompt_generated` - Creating AI prompts
- `prompt_copied` - Copying prompts to clipboard
- `prompt_save_attempt` - Trying to save prompts

### Data Collected
- **User Info**: Name, email, signup date, authentication provider
- **Location**: City, region, country (from IP address)
- **Engagement**: Action counts, last activity, engagement scores
- **Feature Usage**: Which modules and templates are most popular
- **Timing**: When actions occur (formatted in AM/PM)

## 🎨 Admin Dashboard Features

### Statistics Overview
- Total Users
- Active Users (30 days)
- Average Engagement Score
- Total Actions

### Users Tab
- User registration details
- Location information
- Engagement scores
- Feature usage breakdown
- Last activity timestamps

### Engagement Tab
- User engagement metrics
- Action frequency
- Most used features
- Activity patterns

### Features Tab
- Feature popularity analysis
- Usage statistics
- User adoption rates
- Most active users per feature

## 📤 CSV Export

Each tab exports different data:

- **Users**: Complete user profiles with engagement data
- **Engagement**: User engagement metrics and patterns
- **Features**: Feature usage statistics and analytics

Files are named: `user-analytics-{tab}-{date}.csv`

## 🕐 Time Formatting

All timestamps are now displayed in **AM/PM format** instead of 24-hour:
- **Before**: `2024-01-15 14:30:00`
- **After**: `01/15/2024, 02:30 PM`

## 🚀 Testing the System

### 1. Create Test Users
- Sign up with email/password
- Sign in with Google
- Use the AI Prompt Builder

### 2. Generate Activity
- Switch between modules
- Generate prompts
- Copy prompts
- Try to save prompts

### 3. Check Admin Dashboard
- View user analytics
- Check engagement metrics
- Export CSV data
- Verify time formatting

## 🔍 Monitoring & Analytics

### Key Metrics to Watch
- **User Growth**: New signups over time
- **Engagement**: How often users return
- **Feature Adoption**: Which tools are most popular
- **User Retention**: How long users stay engaged

### Location Insights
- Where are your users located?
- Are there regional preferences for certain features?
- Which areas have the highest engagement?

## 🛠️ Customization Options

### Adding New Tracking Events
To track additional user actions, add this to your JavaScript:

```javascript
// Track custom action
trackUserActivity('custom_action', {
  custom_field: 'value',
  additional_data: 'more info'
});
```

### Modifying Engagement Scoring
Edit the scoring logic in `database-schema.sql`:

```sql
CASE 
  WHEN COUNT(ua.id) >= 20 THEN 100  -- More actions needed
  WHEN COUNT(ua.id) >= 10 THEN 80   -- Adjusted thresholds
  WHEN COUNT(ua.id) >= 5 THEN 60
  WHEN COUNT(ua.id) >= 2 THEN 30
  WHEN COUNT(ua.id) >= 1 THEN 15
  ELSE 0
END as engagement_score
```

### Adding New Analytics Views
Create additional views in Supabase for specialized analytics:

```sql
CREATE VIEW feature_popularity AS
SELECT 
  action,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users
FROM user_activity 
WHERE action LIKE 'prompt_%'
GROUP BY action
ORDER BY usage_count DESC;
```

## 🚨 Troubleshooting

### Common Issues

1. **No Data Appearing**
   - Check Supabase connection
   - Verify environment variables
   - Check browser console for errors

2. **Time Format Issues**
   - Ensure JavaScript date functions are working
   - Check browser locale settings

3. **Tracking Not Working**
   - Verify user authentication
   - Check Netlify function logs
   - Ensure database tables exist

### Debug Mode
Enable console logging by checking browser developer tools for:
- User activity tracking calls
- API responses
- Error messages

## 📈 Next Steps

### Advanced Features to Consider
1. **Real-time Dashboard** with WebSocket updates
2. **Email Reports** with weekly/monthly summaries
3. **User Segmentation** based on behavior patterns
4. **A/B Testing** for different features
5. **Predictive Analytics** for user churn prevention

### Integration Opportunities
1. **Google Analytics** for broader web analytics
2. **Mixpanel** for advanced user behavior tracking
3. **Hotjar** for user session recordings
4. **Intercom** for user communication and support

## 🎉 Success Metrics

You'll know the system is working when you can:
- ✅ See real-time user activity in admin
- ✅ Export comprehensive CSV reports
- ✅ View engagement scores and trends
- ✅ Identify your most active users
- ✅ Understand feature popularity
- ✅ Track user location data
- ✅ Monitor user retention patterns

---

**Need Help?** Check the browser console for error messages and verify all environment variables are set correctly in Netlify.
