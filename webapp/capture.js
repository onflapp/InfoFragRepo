$(function() {
  DropZone.init();

  const td = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced'
  });

  td.addRule('images', {
    filter: ['img','video'],
    replacement: function (content) {
      return '';
    }
  });

  $('#act_paste').on('click', function() {
    navigator.clipboard.read().then(function(paste) {
      let cl = paste[0];
      if (cl.types.indexOf('text/html') >= 0) {
        cl.getType('text/html').then(function(blob) {
          blob.text().then(function(txt) {
            let md = td.turndown(txt);
            $('#sec_comments').val(md);
          });
        });
      }
      else if (cl.types.indexOf('text/plain') >= 0) {
        cl.getType('text/plain').then(function(blob) {
          blob.text().then(function(txt) {
            $('#sec_comments').val(txt);
          });
        });
      }
    });
    return false;
  });
});
