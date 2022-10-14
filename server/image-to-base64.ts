const files = require('fs');

interface ConverterArguments {
    left: string,
    right: string, 
    width : number,
    callback : (image:string) => any,
    onFinish? : () => any
}

const makeFileIterator = (width: number) => {
    let num = 0;

    const stringNum = () : string => {
        const str:string[] = num.toString().split('');

        if (str.length > width) {num = 0; return stringNum()}

        while (str.length < width) str.unshift('0');
        return str.join('');
    }

    return () => {
        num++;
        return stringNum();
    }
}

export default async function convertNumberedImagesToBase64(args:ConverterArguments) : Promise<void> {
    const next = makeFileIterator(args.width);

    while (true) {
        let end = false;

        await new Promise(function(resolve) {
            files.readFile (
                args.left + next() + args.right,
                'base64',
                (e:any, data:string) => {
                    if (e !== null) {
                        args.onFinish?.()
                        resolve(true);
                        return;
                    }
    
                    args.callback(data);
                    resolve(false);
                }
            )
        }).then((decision) => end = decision as boolean);

        if (end) break;
    }
}

