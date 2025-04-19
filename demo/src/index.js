
import { info, log } from "@randajan/simple-lib/node";
import createLock from "../../dist/esm/index.mjs";
import { sleep } from "@randajan/sleep";

(async ()=>{
    const start = Date.now();

    const lockA = createLock({
        name:"A",
        on:(lck, status, result)=>{
            console.log(lck.name, status, [lockA.ram, lockB.ram, lockC.ram])
        }
    });

    const lockB = lockA.sub({name:"B"});
    const lockC = lockA.sub({name:"C"});

    await Promise.all([
        lockA.run(_=>sleep(100)),
        lockA.run(_=>sleep(100)),
        lockB.run(_=>sleep(100)),
        lockB.run(_=>sleep(100)),
        lockC.run(_=>sleep(100)),
        lockA.run(_=>sleep(100))
    ]).catch(()=>{});

    console.log("duration", Date.now()-start);

})().catch(err=>console.error(err));
