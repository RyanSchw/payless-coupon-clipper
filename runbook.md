To push changes
- commit changes
- git push heroku main
- go to browser to see changes

Add/remove workers
heroku ps:scale web=1
heroku ps:scale web=0

Logs
heroku logs --tail
