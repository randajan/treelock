import { _privates, bfn, Timeout, toFn, toTimeoutMs, withTimeout } from "./static";

export class TreeLock {
    constructor(options={}) {
        const { name, ttl, on, sup } = options;
        const _pp = _privates.get(sup);

        const _p = {
            sup,
            queue: Promise.resolve(),
            ram:0,
            enqueue: !_pp ? _=>_p.queue : _=>Promise.all([_p.queue, _pp.queue]),
            ttl:toTimeoutMs(ttl) ?? _pp?.ttl,
            on:toFn(on) || _pp?.on || bfn,
        }

        _p.append = (sub)=>{
            if (_p.subs) { _p.subs.push(sub); }
            else {
                _p.subs = [sub];
                const enq = _p.enqueue;
                _p.enqueue = _=>Promise.all([enq(), ..._p.subs.map(b=>b.queue)]);
            }
        }

        const finish = ()=>_p.ram = Math.max(0, _p.ram-1);
        const done = (r) =>{ finish(); _p.on(this, "done"); return r; };
        const crash = (err)=>{
            finish();
            const status = (err instanceof Timeout) ? "timeout" : "error";
            _p.on(this, status, err);
        }

        _p.run = (fn, tms, args)=>{     
            _p.ram++;
            if (this.ram + this.ramSup > 1) { _p.on(this, "enter"); }

            const exec = () => {
                _p.on(this, "start");
                return withTimeout(fn(...args), tms).then(done);
            };
        
            const next = _p.enqueue().then(exec);
            _p.queue = next.catch(crash);
            return next;
        }

        const enumerable = true;
        Object.defineProperties(this, {
            name:{ value:name },
            sup:{ value:sup },
            subs: { get:_=>[..._p.subs] },
            ram:{ enumerable, get:_=>_p.ram },
            ramSup:{ enumerable, get:!_pp ? _=>0 : _=>sup.ram + sup.ramSup },
            ramSub:{ enumerable, get:_=>_p.subs.reduce((r, s)=>r+s.ram+s.ramSub, 0) },
            queue:{ get:_=>_p.queue}
        });

        _privates.set(this, _p);
        if (_pp) { _pp.append(this); }
    }

    run(fn, ttl, ...args) {
        const _p = _privates.get(this);
        ttl = toTimeoutMs(ttl) ?? _p.ttl;
        return _p.run(fn, ttl, args);
    }

    wrap(fn, ttl) {
        const _p = _privates.get(this);
        ttl = toTimeoutMs(ttl) ?? _p.ttl;
        return (...args) => _p.run(fn, ttl, args);
    }

    sub(options={}) {
        return new TreeLock({
            ...options,
            sup:this
        });
    }

}

