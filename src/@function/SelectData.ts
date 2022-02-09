import filestream from 'fs';
import eventstream from 'event-stream';
import moment from 'moment';
const DEL = '|';


/**
 * A function that selects data from a table
 * @param store {string} store name
 * @param key {string} key to delete
 * @returns {Promise<void>}
 */
export default function Select(store: string, key: any) {
    return new Promise((resolve, reject) => {
        if(!store)
            throw reject('EXCEPTION: Store is not defined');
        if(!key)
            throw reject('EXCEPTION: Key is not defined');
        const read = filestream.createReadStream(store);

        read.pipe(eventstream.split()).pipe(
            eventstream.mapSync((line: any) => {
                const data = line.toString().trim().split(DEL);
                if((data[0].toString().trim()) == key){
                    if(data[2].toString() != 'null' && moment().unix() > parseInt(data[2]))
                        return reject('EXCEPTION: Key is expired, cannot select.');
                    read.destroy();
                    return resolve(data[1]);
                }
            })
            .on("error", (error: string) => {
                console.debug('EXCEPTION: ' + error);
                return reject('Error while reading file...');
            })
            .on("end", () => {
                if(!read.destroyed)
                    read.destroy();
                return resolve(null);
            })
        )
    });
};