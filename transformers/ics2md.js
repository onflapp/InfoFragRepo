const tools = require('./../TextTools');

const reject = [
  /^\*\*Microsoft\ Teams meeting\*\*/,
  /^Meeting\ ID:/,
  /^Passcode:/,
  /^Tenant\ key:/,
  /^\*\*Dial\ in\ by\ phone\*\*/,
  /^Phone\ conference\ ID:/,
  /^\*\*Join\ on\ a\ video\ conferencing\ device\*\*/,
  /^Video\ ID:/,
  /^NOTE:\ This\ meeting\ could\ be\ recorded,/,
  /^\[Need\ help\?\]/,
  /^\[Find\ a\ local\ number\]/,
  /^\[More\ info\]/,
  /^Thanks,/,
  /^Thanks a lot,/,
  /^Many thanks,/,
  /^Thank\ you,/,
  /^Microsoft Teams meeting/,
  /^Dial in/,
  /^Join on a video/,
  /\{.*margin.*\}/,
  /.*bookwithme.*/,
  /.*meetingOptions.*/,
  /.*dialin.teams.cloud.microsoft.*/,
  /.*Privacy and security.*/,
  /.*www.webex.com.*/,
  /.*may contain confidential and privileged information.*/,
  /.*JoinTeamsMeeting.*/,
  /.*https:\/\/teams.microsoft.com\/meet.*/
];

const accept = [];

function cleanup_text(text) {
  let r = text;
  r = r.replace(/<!--.*-->/, '');
  r = r.replace(/@media.*\{.*\}/, '');
  r = tools.deduplicate_text(r, accept, reject);

  return r;
}

function parse_body(input, done) {
  const ical = require('node-ical');
  const path = require('path');

  ical.parseFile(input, function(err, data) {
    if (data) {
      let header = {};
      header.type = 'Calendar Event Content';
      header.resource = escape(path.basename(input));

      let markdown = '# Calendar Events\n\n';

      for (const k in data) {
        if (data.hasOwnProperty(k)) {
          const ev = data[k];
          
          if (ev.type === 'VEVENT') {
            let title = ev.summary || 'Without Title';
            let location = ev.location;
            let organizer = ev.organizer;
            let description = ev.description;
            let attendee = ev.attendee;
            if (attendee && Array.isArray(attendee) == false) attendee = [attendee];
            
            let startDate = ev.start ? new Date(ev.start).toISOString() : null;
            let startTime = ev.start ? new Date(ev.start).toISOString() : null;

            markdown                += '## ' + title + '\n\n';
            if (startDate) markdown += '**Start Date:** ' + startDate + '  \n';
            if (startTime) markdown += '**Start Time:** ' + startTime + '  \n';
            if (location) markdown  += '**Location:** ' + location + '  \n';

            if (organizer) {
              markdown += '**Organizer:** '
              let name = organizer.params.CN;
              let email = organizer.val;

              markdown += name;
              if (email) markdown += ' ['+email.replace(/^mailto:/,'')+']('+email+')\n';

              markdown += '  \n';
            }

            if (attendee) {
              markdown += '\n### Attendees:\n\n';

              attendee.forEach(function(it) {
                let name = it.params.CN;
                let email = it.val;

                markdown += '- '+name;
                if (email) markdown += ' ['+email.replace(/^mailto:/,'')+']('+email+')\n';
              });
            }

            if (description) {
              markdown += '\n### Description of the event\n\n';
              markdown += cleanup_text(description);
            }

            markdown += '\n---\n';
          }
        }
      }

      done(header, markdown);
    }
    else {
      done();
    }
  });
}

function transform(input, done) {
  const tools = require('./../TextTools');
  const action = 'Summarize the meeting information in 3 sentences. Leave any information about how to connect or how to join';

  parse_body(input, function(header, markdown) {
    if (header) {
      tools.summarize_text(action, markdown, function(summary) {
        done({metadata:header, content:markdown, summary:summary});
      });
    }
    else {
      done();
    }
  });
}

module.exports = {
  transform:transform,
  parse_body:parse_body
};
