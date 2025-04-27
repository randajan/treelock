
import { timeout } from "@randajan/sleep";


export const _privates = new WeakMap();

export const bfn = ()=>{};
export class Timeout extends Error {}

export const toInt = (num, min, max, errorName)=>{
    if (num == null) { return; }
    const tp = typeof num;
    if (tp !== "number") { throw new Error(`Expects '${errorName}' to be a 'number' but received '${tp}'`); }
    if (min != null && num < min) { throw new Error(`Expects '${errorName}' to be greater than '${min}' but received '${num}'`); }
    if (max != null && num > max) { throw new Error(`Expects '${errorName}' to be lesser than '${max}' but received '${num}'`); }
    return Math.round(num);
}

export const toTimeoutMs = (num)=>toInt(num, 0, 2147483647, "timeout");

export const withTimeout = (prom, tms)=>{
    if (!tms) { return prom; }
    return Promise.race([prom, timeout(tms, new Timeout(`Execution time exceeded ${tms/1000}s`))]);
}


export const toFn = (any, errorName)=>{
    if (any == null) { return; }
    const tp = typeof any;
    if (tp !== "function") { throw new Error(`Expects '${errorName}' to be a 'number' but received '${tp}'`); }
    return any;
}