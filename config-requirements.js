function check_requirements(config, reqs) {
    let missing_reqs = [];
    for(let req of reqs) {
        if(!config[req]) {
            missing_reqs.push(req);
        }
    }
    return missing_reqs;
}

module.exports.check_requirements = check_requirements;
/*
class ConfigRequirements {
    constructor() {
    }
}

Object.prototype.check = function(config) {
    if(!config[this]) {
        return this;
    }
}

class All extends ConfigRequirements {
    constructor(...args) {
        super();
        this.reqs = [...args];
    }

    check(config) {
        let ret = this.reqs.reduce((prevReqs, nextReq) => {
            let missingReqs = nextReq.check(config);
            return missingReqs ? all(missingReqs, ...prevReqs.reqs) : prevReqs;
        }, all());
        return ret.reqs ? ret : null;
    }

    toString() {
        return this.toStringHelper(0);
    }

    toStringHelper(level) {
        level = level || 0;
        return "any of the following:\n" + this.reqs.reduce((accumulatedString, nextReq) =>
            accumulatedString + level.toString() +
                (nextReq instanceof ConfigRequirements ?
                    nextReq.toStringHelper(level + 1) :
                    nextReq.toString())
                +"\n", "");
    }
}

class Any extends ConfigRequirements {
    constructor(...args) {
        super();
        this.reqs = [...args];
    }

    check(config) {
        if(this.reqs.every(req => req.check(config))) {
            return this;
        }
    }

    toString() {
        return this.toStringHelper(0);
    }

    toStringHelper(level) {
        level = level || 0;
        return "any of the following:\n" + this.reqs.reduce((accumulatedString, nextReq) =>
            accumulatedString + level.toString() +
            (nextReq instanceof ConfigRequirements ?
                nextReq.toStringHelper(level + 1) :
                nextReq.toString())
            +"\n", "");
    }
}

class Not extends ConfigRequirements {
    constructor(req) {
        super();
        this.req = req;
    }

    check(config) {
        if(!this.req.check(config)) {
            return this;
        }
    }

    toString() {
        return this.toStringHelper(0);
    }

    toStringHelper(level) {
        return "NOT " + (this.req instanceof ConfigRequirements ? this.req.toStringHelper(level) : this.req.toString());
    }
}

function any(...args) {
    return new Any(args);
}

function all(...args) {
    return new All(args);
}

function not(req) {
    return new Not(req);
}

function check_requirements(config, reqs) {
    return reqs.check(config);
}

module.exports.any = any;
module.exports.all = all;
module.exports.not = not;

 */