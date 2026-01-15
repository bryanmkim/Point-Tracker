# Badminton Tournament Point Tracker
## Features

- **Live Rankings**: Real-time leaderboard with player rankings
- **Admin Mode**: Secure password-protected admin interface
- **Point Management**: Add/subtract points for each player
- **Statistics**: View total players, games played, and current leader
- **Recent Updates**: Track all scoring changes with timestamps
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Data Persistence**: All data saved locally in your browser
- **Export/Import**: Backup your tournament data

## Quick Start

1. Open `index.html` in your web browser
2. Click "Admin Mode" to set up players and manage scores
3. Default admin password is `admin123` (change this in settings!)
4. Add players and start tracking scores
5. View rankings on the main page

## Admin Features

- **Add Players**: Create new players with optional starting points
- **Manage Scores**: Add or subtract points from any player
- **Quick Actions**: Reset all scores or clear all data
- **Password Management**: Change the admin password
- **Data Export**: Download your tournament data as JSON

## File Structure

```
SundayChallengeTracker/
├── index.html      # Main rankings page
├── admin.html      # Admin management interface
├── styles.css      # All styling and responsive design
├── script.js       # Application logic and data management
└── README.md       # This file
```

## Default Settings

- **Admin Password**: `admin123` (please change this!)
- **Data Storage**: Browser localStorage (stays on your device)
- **Auto-refresh**: Rankings update every 30 seconds

## Customization

### Changing the Admin Password
1. Go to Admin Mode
2. Login with current password
3. Use the Settings section to change password
4. Confirm new password

### Point System
- Points can be any positive number
- Players can't go below 0 points
- Each score change counts as a "game played"

## Troubleshooting

**Can't access Admin Mode?**
- Default password is `admin123`
- Check browser console for any errors

**Rankings not updating?**
- Refresh the page
- Check if JavaScript is enabled

**Lost admin password?**
- Open browser developer tools
- Go to Application > Local Storage
- Delete `sundayChallengeAdminPassword` to reset to `admin123`
