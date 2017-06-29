owanotify Firefox Extension
===========================

One important thing which is really missing from Outlook Web Access (OWA) 
compared to its Desktop counterpart is on-screen notification when new
email arrives or the next meeting is about to start.

This extension fills this gap by showing Browser-based desktop notifications
and by highlighting the favicon with a red dot.

Technically it works by periodically inspecting the HTML elements of the top
navigation bar. This happens automatically on any web site that contains "/owa/"
in its URL.

Following events are currently supported:

- New Mails \
  Unfortunately OWA does not provide us a counter, so only the first unseen
  mail triggers a notification. There is no email preview either.
- New Calendar events \
  OWA reports the number of event reminders. Unfortunately there are no more
  details, so no starting time, room or subject can be shown.
