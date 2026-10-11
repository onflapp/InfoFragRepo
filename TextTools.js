function split_sentences(text) {
  const split = require('sentence-splitter').split;
  const nodes = split(text);

  const sentences = nodes.filter(node => node.type === "Sentence").map(node => node.raw);
  return sentences;
}

function cleanup_text(text) {
  const removeMd = require('remove-markdown');

  // normalize line endings
  let ntext = removeMd(text.replace(/\r?\n|\r/g, '\n'));
  let lines = ntext.split('\n');
  let rv = [];

  // split long lines
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.length > 70) {
      rv = rv.concat(split_sentences(line));
    }
    else {
      rv.push(line);
    }
  }

  return rv.join('\n');
}

function extract_context(text, query, max) {
  let lines = cleanup_text(text).split('\n');
  let rv = [];
  lines.forEach(function(line) {
    rv = rv.concat(extract_context_line(line, query, max));
  });
  return rv;
}

function extract_context_line(text, query, max = 5) {
  const stowords = require('stopword').eng;

  let words = text.split(/\b/);
  let terms = query.split(' ');
  let range = max;

  const targetSet = new Set(
    (terms).map((t) => t.toLowerCase())
  );

  // 1. Build one window per match (end is inclusive)
  const windows = [];
  words.forEach((word, i) => {
    let w = word.trim().toLowerCase();
    w = w.replace(/^_+/, '');
    w = w.replace(/_+$/, '');

    if (targetSet.has(w)) {
      windows.push({
        start: Math.max(0, i - range),
        end: Math.min(words.length - 1, i + range),
        matches: [{ word, index: i }],
      });
    }
  });

  // 2. Merge overlapping or touching windows (already sorted by start)
  const merged = [];
  for (const w of windows) {
    const last = merged[merged.length - 1];
    if (last && w.start <= last.end + 1) {
      last.end = Math.max(last.end, w.end);
      last.matches.push(...w.matches);
    } else {
      merged.push({ ...w, matches: [...w.matches] });
    }
  }

  // 3. Attach the actual words for each merged window
  const results = merged.map(({ start, end, matches }) => ({
    start,
    end,
    matches,
    words: words.slice(start, end + 1),
  }));

  let rv = [];
  results.forEach(function (it) {
    if (stowords.indexOf(it.words[0]) >= 0) it.words.shift();
    if (stowords.indexOf(it.words[it.words.length-1]) >= 0) it.words.pop();

    rv.push(it.words.join(''));
  });

  return rv;
}

module.exports = {
  split_sentences:split_sentences,
  cleanup_text:cleanup_text,
  extract_context:extract_context
};
