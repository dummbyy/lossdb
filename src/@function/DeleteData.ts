import filestream from 'fs';
import eventstream from 'event-stream';
import moment from 'moment';
import ReplacePath from '../@utils/Replace';

const NEWL:string = '\n';
const DEL:string  = '|';
/**
 * A function that deletes data from a table
 * @param store {string} store name
 * @param key {string} key to delete
 * @returns {Promise<void>}
 */
export default function Delete(store: string, key: any) {
    const updated = `${store}_updated`;
    return new Promise((resolve, reject) => {
        if(!store)
            throw 'EXCEPTION: Store is not defined';
        
        const read = filestream.createReadStream(store);
        const write = filestream.createWriteStream(updated, { encoding: 'utf-8', flags: 'a' });
        let DISCARD:boolean = false;
        let REMOVED:boolean = false;

        read.pipe(eventstream.split()).pipe(
            eventstream.mapSync((line: any) => {
                const data = line.toString().trim().split(DEL);
                // If data[0] is not equal to key, write to updated file
                if((data[0].toString().trim()) == key){
                    if((data[2].toString() != 'null') && (moment().unix() > parseInt(data[2]))) {
                        DISCARD = true;
                        return reject('EXCEPTION: Key is expired, cannot delete.');
                    }
                    REMOVED = true;
                    line = '';
                }
                write.write((line.trim()) == '') ? line : (line + NEWL);
            })
            .on('error', (error: string) => {
                console.debug('EXCEPTION: ' + error);
                return reject('Unexpected Error');
            })
            .on('end', () => {
                if(!read.destroyed)
                    read.destroy();
                write.end();
                // If discard is true and removed is false, return true
                if(!DISCARD && REMOVED)
                    return resolve(true);
                // If discard and removed is false, return false
                if(!DISCARD && !REMOVED)
                    return resolve(false);
            })
        );
        write.on('finish', () => {
            try 
            {
                if(DISCARD)
                    return filestream.unlinkSync(updated);
                ReplacePath(store, updated);
            }
            catch(error: any)
            {
                console.debug('EXCEPTION: ' + error);
                return reject('Unexpected Error');
            }
        })
    });
};