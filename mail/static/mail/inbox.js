document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document.querySelector("#inbox").addEventListener("click", () => load_mailbox("inbox"));
  document.querySelector("#sent").addEventListener("click", () => load_mailbox("sent"));
  document.querySelector("#archived").addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");
});


function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";

  document.querySelector('#alert').style.display = "none";
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3 class="mb-3, ${mailbox}">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // GET mails
  getMail(mailbox);
}


// Render mails
function renderMails(emails) {
  const h3 = document.querySelector('.sent');

  const table = document.createElement('table');
  table.className = 'table'

  emails.forEach((email) => {
    let tablerow = document.createElement('tr');
    let cellSender = document.createElement('td');
    let cellSubject = document.createElement('th');
    let cellTime = document.createElement('td');

    cellSubject.innerHTML = email.subject;
    cellTime.className = 'text-muted textright';
    cellTime.innerHTML = email.timestamp;

    // Assign mail GET function
    tablerow.addEventListener('click', () => {
      checkMail(email.id);
    })

    // Assign clickable CSS class
    tablerow.className = 'clickable';
    
    if (email.read == true) {
      tablerow.className = 'clickable table-secondary';
    } else {
      tablerow.className = 'clickable';
    }

    // Change from to To: if mailbox is sent
    if (h3) {
      let recipients = email.recipients.toString();
      recipients = recipients.split(',').join(', ');
      cellSender.innerHTML = `To: ${recipients}`;
    } else {
      cellSender.innerHTML = email.sender;
    }

    tablerow.append(cellSender, cellSubject, cellTime);
    table.append(tablerow);
  })
  document.querySelector('#emails-view').append(table);
}


// Display email in  email-view
function renderMail(email) {
  let emailview = document.querySelector("#email-view");
  emailview.style.display = "block";
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";
  
  // Delete if email exists
  removeChildren(emailview);

  // Create email view HTML elements
  const from = document.createElement('p');
  const to = document.createElement('p');
  const subject = document.createElement('p');
  const timestamp = document.createElement('p');
  const hr = document.createElement('hr');
  const body = document.createElement('p');

  // Populate email view with data
  from.innerHTML = `From: <strong>${email.sender}</strong>`;

  // Add , if recipients more then 1
  let recipients = '';
  if (email.recipients.length == 1) {
    to.innerHTML = `To: <strong>${email.recipients[0]}</strong>`;
    recipients = email.recipients[0];
  } else {
    let emailrecipients = email.recipients;
    let r = 1;
    emailrecipients.forEach(emailrecipient => {
      recipients += emailrecipient;
      if (emailrecipients.length > r) {
        recipients += ', '
      }
      r++;
    });
    to.innerHTML = `To: <strong>${recipients}</strong>`;
  };

  subject.innerHTML = `Subject: <strong>${email.subject}</strong>`;
  timestamp.innerHTML = `Timestamp: <strong>${email.timestamp}</strong>`;
  body.innerHTML = email.body;

  // Create email view HTML buttons
  const btndiv = document.createElement('div');
  const replybtn = document.createElement('button');
  const archivebtn = document.createElement('button');

  btndiv.className = 'd-flex justify-content-between';

  let n;

  // check if mail is archived and assign true/false to n
  if (email.archived == false) {
    archivebtn.className = 'btn btn-sm btn-outline-danger float-end';
    archivebtn.innerHTML = 'Archive';
    n = true;
  } else {
    archivebtn.className = 'btn btn-sm btn-danger float-end';
    archivebtn.innerHTML = 'Unarchive';
    n = false;
  }

  archivebtn.addEventListener('click', () => {
    archiveMail(email.id, n);
  });

  replybtn.className = 'btn btn-sm btn-primary';
  replybtn.innerHTML = 'Reply';

  btndiv.append(replybtn, archivebtn);
  document.querySelector('#email-view').append(from, to, subject, timestamp, hr, body, btndiv);
  
  replybtn.addEventListener('click', () => {
    compose_email();
    replyMail(email.sender, email.subject, email.timestamp, email.body)
  });
}


// POST mail on click
function sendMail() {
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  postMail(recipients, subject, body);
}


function replyMail(sender, subject, timestamp, body) {
  // Clear out composition fields
  document.querySelector("#compose-recipients").value = sender;
  document.querySelector("#compose-subject").value = `Re: ${subject}`;
  document.querySelector("#compose-body").value = 
  `On ${timestamp} ${sender} wrote:
${body}`;
}


// Collect email by GET method
function getMail(mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    if (emails.length === 0) {
      message('No emails yet.');
    } else {
      renderMails(emails);
    }
  });
}


// Collect email data by GET
function checkMail(email_id) {
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    if (email.read == 0) {
      readMail(email.id);
    }
    renderMail(email);
  });
}


// Mark mail as read
function readMail(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: 1,
    })
  });
}


// Mark mail as archive
function archiveMail(email_id, n) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: n,
    })
  })
  .then(() => {
    load_mailbox('inbox');
  });
}


// Send mail by POST
function postMail(recipients, subject, body) {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    })
  })
  .then(response => response.json())
  .then(sentmail => {
    if (sentmail['error']) {
      document.querySelector('#alert').style.display = 'block';
      const error = document.querySelector('.error');
      error.innerHTML = sentmail.error;
    } else {
      load_mailbox('sent');
    }
  });
  false;
}


// Deletes already rendered elements children
function removeChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}


// Renders alert messages
function message(message) {
  let h5 = document.createElement('h5');
  h5.innerHTML = message;
  document.querySelector('#emails-view').append(h5);
}