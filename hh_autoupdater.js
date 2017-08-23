const
  http = require('https'),
  resumeId = [],
  getUrl = (id, action) => id + (action ? '/' + action : ''),
  accessToken = process.argv.slice(2)[0],
  basePath = '/resumes/',
  options = {
      host: 'api.hh.ru',
      port: 443,
      path: basePath,
      headers: {
        'User-Agent'   : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                         'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.' +
                         '0.3112.90 Safari/537.36',
        'Authorization': 'Bearer '+ accessToken
      }
  };

call('mine', 'GET', addIds);

function call(url, method, callback) {
  options.path = basePath + url;
  options.method = method ? method : 'GET';
  if (!callback) {
    callback = (data) => { console.log(data) };
  }
  let req = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', (data) => callback(data));
  });
  req.end();
}

function setIntervals(data) {
  data = JSON.parse(data);
  let intervalMs = new Date(data.next_publish_at).getTime() -
                   new Date().getTime();
  if (intervalMs < 0) {
    call( getUrl(this.id, 'publish'), 'POST');
    console.log('Resume id: ' + this.id + ' was updated');
    call(getUrl(this.id), 'GET', setIntervals.bind({id : this.id}));
  } else {
    let hours = parseInt(intervalMs / 1000 / 60 / 60 %24),
        minutes = parseInt(intervalMs / 1000 / 60 %60);
    console.log('Resume id: ' + this.id + ' cant be updated, waiting: ' +
                hours + 'h ' + minutes + 'm');
    setTimeout(() => call('mine', 'GET', addIds), intervalMs);
  }
}

function addIds(data) {
  data = JSON.parse(data);
  if (!data.items) {
    console.log('Something went wrong...');
  }
  data.items.forEach(resume => resumeId.push(resume.id));
  resumeId.forEach(id => call(getUrl(id), 'GET', setIntervals.bind({id : id})));
}


