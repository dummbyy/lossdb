import filestream from 'fs';
import eventstream from 'event-stream';
import moment from 'moment';
import ReplacePath from '../@utils/Replace';
const DEL = '|';
const NEWL = '\n';

/**
 * A function that updates data in a table
 * @param store {string} store name
 * @param key {string} key to delete
 * @param value {string} value to delete
 * @param expire {string} expire time
 * @returns {Promise<void>}
 */
export default function Update(store: string, key: any, value: any, expire: number | null) {
    const updated = `${store}_updated`;
    return new Promise((resolve, reject) => {
        if(!store)
            throw 'EXCEPTION: Store is not defined';
        
        const read = filestream.createReadStream(store);
        const write = filestream.createWriteStream(updated, { encoding: 'utf-8' ,flags: 'a' });

        let DISCARD:boolean = false;
        let UPDATED:boolean = false;

        read.pipe(eventstream.split()).pipe(
            eventstream.mapSync((line: any) => {
                const data = line.toString().trim().split(DEL);
                // If data[0] is not equal to key, write to updated file
                if((data[0].toString().trim()) == key){
                    if((data[2].toString() != 'null') && (moment().unix() > parseInt(data[2]))) {
                        DISCARD = true;
                        return reject('EXCEPTION: Key is expired, cannot update.');
                    }
                    UPDATED = true;
                    expire  = expire ? moment().add(expire, 'seconds').unix() : null;
                    value   = value ? JSON.stringify(value) : null;
                    line    = `${key}${DEL}${value}${DEL}${expire}`;
                }
                write.write(line == '' ? line : line + NEWL);
            })
            .on("error", (error: string) => {
                console.debug('EXCEPTION: ' + error);
                return reject('Unexpected Error');
            })
            .on("end", () => {
                if(!read.destroyed)
                    read.destroy();
                write.end();
                if(UPDATED && !DISCARD)
                    return resolve(true)
                if(!UPDATED && !DISCARD)
                    return resolve(false)
            })
        )
        write.on("finish", () => {
            try 
            {
                if(DISCARD)
                    return filestream.unlinkSync(updated);
                ReplacePath(store, updated);
            }
            catch(error)
            {
                console.debug('EXCEPTION: ' + error);
                return reject('Unexpected Error');
            }
        })
    })
}