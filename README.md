# embed-google-maps-from-google-calendar
List descriptions and embed Google Maps of upcoming Google Calendar events

See a live version of this code running at https://www.macnnoodles.com/mac-tracker


Steps to set up project
Make Your Calendar Public:
1. Go to https://calendar.google.com
2. In the top right, click Settings Settings.
3. On the left side under "Settings for my calendars", click the name of the calendar you want to use.
4. Under Access Permissions checkmark "Make available to public"
5. (might not be necessary) Click Get shareable link, and copy the calendar ID, which is everything after ?cid=

Edit the ajax code
1. Use your API key or to signup go to https://developers.google.com/calendar/quickstart/js, click "Enable the google calendar API" and copy the api key.
2. Build your link - ignore any curly braces and remove all spaces from the url
2a. If using a regular user account build your link as follows:
  https://www.googleapis.com/calendar/v3/calendars/{your gmail username}@gmail.com/events?key={Your Calendar API Key}
2b. If using a group account build your link as follows. Might need to put the cid string + _you@group.calendar:
  https://www.googleapis.com/calendar/v3/calendars/{your gmail username}@group.calendar.google.com/events?key={Your Calendar API Key}
3. Inside /js/scripts.js around line 120, put your link where it says xhttp.open("GET", "your calendar link goes here", true);




