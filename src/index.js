/**
 * @author Mert Karaca
 * @version 0.0.1
 */

const Delete = require("./@function/DeleteData");
const Insert = require("./@function/InsertData");
const Select = require("./@function/SelectData");
const Update = require("./@function/UpdateData");

const moment = require('moment');
const fs     = require('fs');
const lockf  = require('lockfile');
const ErrorHandler = require("./@utils/ErrorHandler");

const SIN_TRAN  = 16416 + 2 + 4;
const DATA_SIZE = 2 * 1024 * 1024 * 1024;
const MX_OP     = DATA_SIZE / SIN_TRAN;
const NUM_OP    = 0;

function lossdb(path) {
    if(!(this instanceof lossdb))
        return new lossdb(path);
    if(!this.FILE_PATH)
        this.FILE_PATH = path;
    this.FILE_PATH = this.FILE_PATH || process.cwd() + '/' + moment().unix();
    try
    {
        if(!fs.existsSync(this.FILE_PATH))
            fs.createWriteStream(this.FILE_PATH);
        lockf.lockSync(this.FILE_PATH+'.lossdb', {});
        NUM_OP = parseInt(fs.fstatSync(this.FILE_PATH).size / SIN_TRAN);
    }
    catch(err)
    {
        this.FILE_PATH = null;
        ErrorHandler(error);
    }
    process.on("SIGTERM", () => {
        lockf.unlockSync(this.FILE_PATH+'.lossdb', {});
    });

    return this;
}

lossdb.prototype.insert = async (key, value, expire) => {
    try
    {
        if(NUM_OP >= MX_OP && (fs.statSync(this.FILE_PATH).size >= DATA_SIZE))
            throw 'Database is full';
        await Insert(this.FILE_PATH, key, value, expire);
        console.log('INSERT 1');
        NUM_OP += 1;
        return true;
    }
    catch(err)
    {
        ErrorHandler(err);
    }
    return false;
}

lossdb.prototype.update = async (key, value, expire) => {
    try
    {
        if(NUM_OP >= MX_OP && (fs.statSync(this.FILE_PATH).size >= DATA_SIZE))
            throw 'Database is full';
        
        await Update(this.FILE_PATH, key, value, expire);
        return true;
    }
    catch(error)
    {
        ErrorHandler(error);
    }
    return false;
}

lossdb.prototype.delete = async (key) => {
    try
    {
        const res = await Delete(this.FILE_PATH, key);
        console.log('DELETE' + (result ? 1 : 0));
        NUM_OP -= 1;
        return res;
    }
    catch(error)
    {
        ErrorHandler(error);
    }
    return false;
}

lossdb.prototype.select = async (key) => {
    try
    {
        const data = await Select(this.FILE_PATH, key);
        return data;
    }
    catch(error)
    {
        ErrorHandler(error);
    }
    return null;
}