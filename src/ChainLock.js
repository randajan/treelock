import { _privates, bfn, toTimeoutMs, withTimeout } from "./static";


export class ChainLock {
    constructor(timeout) {

        const _p = {
            queue: Promise.resolve(),
            pending:0,
            timeout:toTimeoutMs(timeout),
            enqueue:_=>_p.queue
        }

        _p.run = (fn, tms, args)=>{     
            _p.pending++;

            const exec = () => {
                return withTimeout(fn(...args), tms)
                    .finally(() => _p.pending = Math.max(0, _p.pending-1));
            };
        
            const next = _p.enqueue().then(exec);
            _p.queue = next.catch(bfn);
            return next;
        }

        Object.defineProperties(this, {
            parent:{ get:_=>_p.parent },
            subs: { get:_=>_p.subs },
            pending:{ enumerable:true, get:_=>_p.pending },
            queue:{ enumerable:true, get:_=>_p.queue}
        });

        _privates.set(this, _p);
    }

    run(fn, timeout, ...args) {
        const _p = _privates.get(this);
        timeout = toTimeoutMs(timeout) || _p.timeout;
        return _p.run(fn, timeout, args);
    }

    wrap(fn, timeout) {
        const _p = _privates.get(this);
        timeout = toTimeoutMs(timeout) || _p.timeout;
        return (...args) => _p.run(fn, timeout, args);
    }

    sub(timeout) {
        const _p = _privates.get(this);
        const s = new ChainLock(timeout);

        const _s = _privates.get(s);

        _s.parent = this;
        _s.enqueue = _=>Promise.all([_p.queue, _s.queue]);

        //became parent
        if (!_p.subs) {
            _p.subs = [];
            const enq = _p.enqueue;
            _p.enqueue = _=>Promise.all([enq(), ..._p.subs.map(s=>s.queue)]);
        }
        _p.subs.push(s);

        return s;
    }
}

