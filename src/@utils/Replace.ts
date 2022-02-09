import fs from 'fs';
export default function ReplacePath(_old: any, _new: any) {
    fs.renameSync(_old, _new);
}