import filestream from 'fs';
import eventstream from 'event-stream';
import moment from 'moment';

const NEWL = "\n";
const DEL = "|";

/**
 * A function that inserts data into a table
 * @param store {string} store name
 * @param key {string} key to insert
 * @param value {string} value to be inserted
 * @param expire {number} expire in seconds
 * @returns {Promise<void>} 
 */
export default function Insert(store: string, key: any, value: any, expire?: number | null) {
    return new Promise((resolve, reject) => {
        // If store is not defined, reject
        if(!store)
            throw reject('EXCEPTION: Store is not defined');

        // If key is not defined, reject
        if(!key || key.length > 32)
            throw reject('EXCEPTION: Key is not defined');

        const size = Buffer.byteLength(JSON.stringify(value));
        // If size of value is greater than 1MB, reject
        if(size > 16 * 1024)
            throw reject('EXCEPTION: Value is too big');
            
        const read   = filestream.createReadStream(store);
        const stream = filestream.createWriteStream(store, { encoding: 'utf-8', flags: 'a' });

        let DISCARD: boolean = false;
        read.pipe(eventstream.split().pipe(
            eventstream.mapSync((line: any) => {
                const data = line.toString().trim().split(DEL);
                // If key is already in store, reject
                if(data[0].toString().trim() == key) {
                    read.destroy();
                    DISCARD = true;
                    return reject('EXCEPTION: Key already exists, cannot insert supplied value.');
                }
            })
            .on('error', (err: string) => {
                console.debug('EXCEPTION: ' + err);
                // If error occurs, reject
                return reject('Unexpected Error');
            })
            .on('end', () => {
                // If read stream is not destroyed, destroy it
                if(!read.destroyed)
                    read.destroy();
                if(!DISCARD) {
                    expire = expire ? moment().add(expire, 'seconds').unix() : null;
                    stream.write(key + DEL + JSON.stringify(value) + DEL + expire + NEWL);
                    stream.close();
                    return resolve(true);
                }
            })
        ))
        
    });
};