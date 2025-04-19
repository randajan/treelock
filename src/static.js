
import { timeout } from "@randajan/sleep";


export const _privates = new WeakMap();

export const bfn = ()=>{};

export const toInt = (num, min, max, errorMsg)=>{
    if (num == null) { return; }
    const tp = typeof num;
    if (tp !== "number") { throw new Error(`Expects '${errorMsg}' to be a 'number' but received '${tp}'`); }
    if (min != null && num < min) { throw new Error(`Expects '${errorMsg}' to be greater than '${min}' but received '${num}'`); }
    if (max != null && num > max) { throw new Error(`Expects '${errorMsg}' to be lesser than '${max}' but received '${num}'`); }
    return Math.round(num);
}

export const toTimeoutMs = (num)=>toInt(num, 0, 2147483647, "timeout");

export const withTimeout = (prom, tms)=>{
    if (!tms) { return prom; }
    return Promise.race([prom, timeout(tms)]);
}


