// Create WebSocket connection.
const socket = new WebSocket('ws://' + location.host);

// Connection opened
socket.addEventListener('open', function (event) {
    socket.send('status');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    const parsed = JSON.parse(event.data);
    console.log(parsed);
    if ('status' in parsed) {
        document.getElementById('loading').style['display'] = 'none';
        if (parsed['status'] == 'ok') {
            document.getElementById('whole-form').style['display'] = '';
            document.getElementById('something-wrong').style['display'] = 'none';
        } else {
            document.getElementById('whole-form').style['display'] = 'none';
            document.getElementById('something-wrong').style['display'] = '';
        }
    }
    if ('progress' in parsed) {
        const val = parsed['progress'];
        if (val == 100) {
            document.getElementById('progress-success').style['display'] = '';
            document.getElementById('progress-encapsulate').style['display'] = 'none';
        } else {
            document.getElementById('progress-bar').setAttribute('aria-valuenow', val);
            document.getElementById('progress-bar').setAttribute('style',`width:${val}%`);
        }
    }
});

function sendSubmit() {
    console.log(document.getElementById('email-input').value);
    document.getElementById('email-input').setAttribute('disabled', true);
    document.getElementById('pwd-input').setAttribute('disabled', true);
    document.getElementById('recent-only').setAttribute('disabled', true);
    document.getElementById('send-submit').setAttribute('disabled', true);
    document.getElementById('send-submit').classList.add('disabled');

    document.getElementById('progress-encapsulate').style['display'] = '';

    const user = document.getElementById('email-input').value;
    const pwd = document.getElementById('pwd-input').value;
    const recentOnly = document.getElementById('recent-only').value == 'on';
    const json = JSON.stringify({
        start: true,
        user,
        pwd,
        recentOnly,
    })
    socket.send(json)
}
