
import { info, log } from "@randajan/simple-lib/node";
import createLock from "../../dist/esm/index.mjs";
import { sleep } from "@randajan/sleep";

(async ()=>{
    const start = Date.now();

    const lockA = createLock();
    const lockB = lockA.sub();
    const lockC = lockA.sub();

    const int = setInterval(_=>console.log([lockA.pending, lockB.pending, lockC.pending]), 20);

    let prom = Promise.all([
        lockA.run(_=>sleep(100)),
        lockA.run(_=>sleep(100)),
        lockB.run(_=>sleep(100)),
        lockB.run(_=>sleep(100)),
        lockC.run(_=>sleep(100))
    ]);

    await sleep(10);

    prom = Promise.all([prom, lockA.run(_=>sleep(100))]);

    await sleep(10);

    prom = Promise.all([prom, lockA.run(_=>sleep(100))]);

    await sleep(10);

    prom = Promise.all([prom, lockA.run(_=>sleep(100))]);

    await prom;

    console.log("duration", Date.now()-start);

    await sleep(20);

    clearInterval(int);

})().catch(err=>console.error(err));
