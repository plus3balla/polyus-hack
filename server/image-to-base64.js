"use strict";
const files = require('fs');
const makeFileIterator = (width) => {
    let num = 0;
    const stringNum = () => {
        const str = num.toString().split('');
        if (str.length > width) {
            num = 0;
            return stringNum();
        }
        while (str.length < width)
            str.unshift('0');
        return str.join('');
    };
    return () => {
        num++;
        return stringNum();
    };
};
module.exports = async function convertNumberedImagesToBase64(args) {
    const next = makeFileIterator(args.width);
    while (true) {
        let end = false;
        await new Promise(function (resolve) {
            files.readFile(args.left + next() + args.right, 'base64', (e, data) => {
                if (e !== null) {
                    resolve(true);
                    return;
                }
                args.callback(data);
                resolve(false);
            });
        }).then((decision) => end = decision);
        if (end)
            break;
    }
};
