const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const runPuppeteer = require('./payless')

const app = express();
const expressWs = require('express-ws')(app);


app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('pages/index'))
app.get('/testws', (req, res) => res.render('pages/testws'))
app.get('/screenshot', runPuppeteer)

app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg)
    if (msg == 'status') {
      ws.send(JSON.stringify({ status: 'ok' }));
    } else if (msg.startsWith('{')) {
      const parsed = JSON.parse(msg);
      if ('start' in parsed) {
        (async () => {
          for (let i = 0; i <= 100; i += 10) {
            await new Promise((res, rej) => { setTimeout(res, 1000) });
            console.log(i);
            ws.send(JSON.stringify({ status: 'ok', progress: i }));
          }
        })()
      }
    } else {
      ws.send(JSON.stringify({ status: 'error' }));
    }
  });
  console.log('something connected!');
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
