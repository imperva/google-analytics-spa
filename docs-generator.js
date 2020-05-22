const path = require('path');
const markdownMagic = require('markdown-magic');
const JSDOC = require('markdown-magic-jsdoc');

const mmdConfig = {
    matchWord: 'MARKDOWN-MAGIC',
    transforms: {
        JSDOC,
    },
};

// eslint-disable-next-line no-unused-vars
const callback = function(updatedContent, outputConfig) {
    console.log('\x1b[32m%s\x1b[0m', 'markdown magic finished.');
};

const markdownPath = path.resolve('./README.md');
markdownMagic(markdownPath, mmdConfig, callback);
