const https = require('https');
const urls = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
  'https://media.w3.org/2010/05/bunny/movie.mp4',
  'https://media.w3.org/2010/05/video/movie_300.mp4',
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
];

urls.forEach(function(u) {
  https.get(u, function(r) {
    console.log(r.statusCode, r.headers['content-type'] || '', u);
  }).on('error', function(e) {
    console.log('ERR', u, e.message);
  });
});
