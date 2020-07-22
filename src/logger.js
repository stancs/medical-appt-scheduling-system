const log4js = require('log4js');

// If no log level setting exists, then the default log level is 'info'
const defaultLogLevel = process.env.LOG_LEVEL || 'info';

// Currently we set appenders only to stdout to show log messages on the screen
// In the future, we will setup file-based log messages
log4js.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: 'pattern',
                // %[ start a coloured block (colour will be taken from the log level, similar to colouredLayout)
                // %] end a coloured block
                // %d date, formatted - default is ISO8601
                // %p log level
                // %f full path of filename (requires enableCallStack: true)
                // %l line number (requires enableCallStack: true)
                pattern: '%[[%d] [%5p] %f:%l%] - %m',
            },
        },
        // Activate this part to write file-based log file
        // file: {
        //   type: 'file',
        //   filename: 'logs/access.log',
        // },
    },
    categories: {
        default: {
            appenders: [
                'out',
                // 'file' // Activate this part to write file-based log file
            ],
            level: defaultLogLevel,
            enableCallStack: true,
        },
    },
});

module.exports = {
    log: log4js.getLogger(),
};
