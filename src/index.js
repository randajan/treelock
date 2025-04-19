import { ChainLock } from "./ChainLock";


export { ChainLock };

export default (timeout)=>new ChainLock(timeout);
