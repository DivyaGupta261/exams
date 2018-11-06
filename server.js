// server.js

// DEPENDENCIES AND SETUP
// ===============================================

var express = require('express'),
  app = express(),
  port = Number(process.env.PORT || 8080),
  bodyParser = require('body-parser'), // Middleware to read POST data
  moment = require('moment');


// const moment = require('moment-timezone');

// DATABASE
// ===============================================

// Setup the database.
var Datastore = require('nedb');
var db = new Datastore({
  filename: 'exams.db', // provide a path to the database file
  autoload: true, // automatically load the database
  timestampData: true // automatically add and manage the fields createdAt and updatedAt
});

// Let us check that we can save to the database.
// Define a exam.
var exams = [
  {
    subject: 'OBJECT ORIENTED PROGRAMMING AND DATA STRUCTURES',
    semester: 3,
    date: new Date(2018, 10, 8, 14),
  },
  {
    subject: 'SATELLITE COMMUNICATION',
    semester: 7,
    date: new Date(2018, 10, 9, 10),
  },
  {
    subject: 'PRINCIPLES OF DIGITAL SIGNAL PROCESSING',
    semester: 5,
    date: new Date(2018, 10, 10, 10),
  },
  {
    subject: 'ELECTRO MAGNETIC INTERFERENCE AND COMPATIBILITY',
    semester: 7,
    date: new Date(2018, 10, 12, 10),
  },
  {
    subject: 'COMPUTER ARCHITECTURE',
    semester: 6,
    date: new Date(2018, 10, 14, 10),
  },
  {
    subject: 'EMBEDDED AND REAL TIME SYSTEMS',
    semester: 7,
    date: new Date(2018, 10, 15, 10),
  },
  {
    subject: 'CONTROL SYSTEM ENGINEERING',
    semester: 4,
    date: new Date(2018, 10, 16, 14),
  },
  {
    subject: 'ELECTRONIC CIRCUITS 2',
    semester: 4,
    date: new Date(2018, 10, 19, 14),
  },
  {
    subject: 'RF AND MICROWAVE ENGINEERING',
    semester: 7,
    date: new Date(2018, 10, 19, 10),
  },
  {
    subject: 'DIGITAL COMMUNICATION',
    semester: 5,
    date: new Date(2018, 10, 20, 10),
  },
  {
    subject: 'ELECTRICAL ENGINEERING AND INSTRUMENTATION',
    semester: 3,
    date: new Date(2018, 10, 20, 14),
  },
  {
    subject: 'OPTICAL COMMUNICATION AND NETWORKS',
    semester: 7,
    date: new Date(2018, 10, 23, 10),
  },
  {
    subject: 'COMMUNICATION THEORY',
    semester: 4,
    date: new Date(2018, 10, 24, 14),
  },
  {
    subject: 'TRANSMISSION LINES AND WAVE GUIDES',
    semester: 5,
    date: new Date(2018, 10, 29, 10),
  },
  {
    subject: 'ELECTROMAGNETIC FIELDS',
    semester: 4,
    date: new Date(2018, 11, 1, 10),
  },

];

// Save this exam to the database.
// db.insert(exams, function(err, newexam) {
//   if (err) console.log(err);
//   console.log(newexam);
// });

// ROUTES
// ===============================================

// Set up body-parser.
// To parse JSON:
app.use(bodyParser.json());
// To parse form data:
app.use(bodyParser.urlencoded({
  extended: true
}));




// Define the home page route.
app.get('/', function(req, res) {
  res.send({text: ['hi exams']});
});

app.post('/', function(req, res) {
  let obj = {
      "fulfillmentText": "Next exam is English",
      "fulfillmentMessages": [
        {
          "text": {
            "text": [
              "This will be text to be displayed on screen."
            ]
          }
        }
      ]
    };
// console.log(req.body);
  let intent = getIntent(req);

  switch (intent) {
    case 'Exams':
      sendNextExamData(res, obj);
      // break;
      return;
    case 'Date-Exam':
      let date = getRequestDate(req);
      if (!date) {
        sendErrorMessage(res, obj);
      }
      sendExamOnDate(res, obj, date);
      // break;
      return;
    case 'Exam-ending':
      sendLastExamData(res, obj);
      // break;
      return;




    default:

  }
  // return res.json(obj);
});

// methods
 function getIntent(req) {
   return req.body.queryResult.intent.displayName;
 }

 function sendNextExamData(res, obj) {

   let examsDb = getAllExams();
   examsDb.exec(function(err, exams) {
     if (err) res.send(err);
     let exam = getNextExam(exams);
     let text = getText(exam);
     obj.fulfillmentText = text;
     res.json(obj);
   });
 }

 function sendLastExamData(res, obj) {
   let examsDb = getAllExams();
   examsDb.exec(function(err, exams) {
     if (err) res.send(err);
     let exam = getLastExam(exams);
     let text = getLastExamText(exam);
     obj.fulfillmentText = text;
     res.json(obj);
   });

 }

 function sendExamOnDate(res, obj, date) {
   let examsDb = getAllExams();
   examsDb.exec(function(err, exams) {
     if (err) res.send(err);
     exams = getExamsOnDate(exams, date);
     let text = getExamsText(exams, date);
     obj.fulfillmentText = text;
     res.json(obj);
   });
 }

 function getExamsOnDate(exams, date) {
   let day = date.getDate();
   let month = date.getMonth();
   let year = date.getFullYear();
   return exams.filter( e => {
     let examDate = new Date(e.date);
     return examDate.getDate() == day && examDate.getMonth() == month && examDate.getFullYear() == year;
   });
 }

 function sendErrorMessage(res, obj) {
   obj.fulfillmentText = "I'm sorry. I can't find that";
   res.json(obj);
 }

 function getRequestDate(req) {
   if (req.body.queryResult.parameters.date) {
     return new Date(req.body.queryResult.parameters.date);
   }
 }

 function getAllExams() {
   return db.find({}).sort({
     updatedAt: -1
   });
 }

 function getNextExam(exams) {
   let now = new Date();
   exams.sort((a, b) => a.date.getTime() - b.date.getTime());
   return exams.find( e => new Date(e.date).getTime() > now.getTime());
 }

 function getLastExam(exams) {
   let now = new Date();
   exams.sort((a, b) => b.date.getTime() - a.date.getTime());
   return exams[0];
 }

 function getText(exam) {
   let date = new Date(exam.date);
   let dateText = moment(date).calendar();
   let text = `The next exam is on ${dateText}. The subject is ${exam.subject}`;
   return text;
 }

 function getLastExamText(exam) {
   let date = new Date(exam.date);
   let dateText = moment(date).calendar();

   let a = moment(date);
   let b = moment();
   let diff = a.diff(b, 'days');

   let text = `The last exam is on ${dateText}. The subject is ${exam.subject}.
   ${diff} days more.`;
   return text;
 }

 function getExamsText(exams, date) {
   let dateText = moment(date).calendar();
   if (exams.length == 0) {
     let initial = `There is no exam on ${dateText}. Enjoy`;
     return initial;
   }
   if (exams.length == 1) {
     let initial = `There is 1 exam on ${dateText}.`;
     let subjects = exams.map(e => e.subject)
     let subjectText = `The subject is ${subjects[0]}`;
     return initial + subjectText;
   }
   let initial = `There are ${exams.length} exams on ${dateText}.`;
   let subjects = exams.map(e => e.subject)
   let subjectText = `The subjects are ${subjects.join(',')}`;
   return initial + subjectText;
 }


// other api calls

// GET all exams.
// (Accessed at GET http://localhost:8080/exams)
app.get('/exams', function(req, res) {
  db.find({}).sort({
    updatedAt: -1
  }).exec(function(err, exams) {
    if (err) res.send(err);
    res.json(exams);
  });
});

// POST a new exam.
// (Accessed at POST http://localhost:8080/exams)
app.post('/exams', function(req, res) {
  var exam = {
    subject: req.body.subject,
    semester: 3,
    date: new Date(2018, 10, 8),
  };
  db.insert(exam, function(err, exam) {
    if (err) res.send(err);
    res.json(exam);
  });
});

// GET a exam.
// (Accessed at GET http://localhost:8080/exams/exam_id)
app.get('/exams/:id', function(req, res) {
  var exam_id = req.params.id;
  db.findOne({
    _id: exam_id
  }, {}, function(err, exam) {
    if (err) res.send(err);
    res.json(exam);
  });
});

// START THE SERVER
// ===============================================

app.listen(port, function() {
  console.log('Listening on port ' + port);
});
