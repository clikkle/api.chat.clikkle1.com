function TypeChecker(literal, name = 'literal') {
    return {
        literal,
        name,
        type: function (type) {
            return this.validate(
                typeof this.literal === type,
                `Expected ${name} of type '${type}'`
            );
        },

        instance: function (cls) {
            const clsName = typeof cls === 'function' ? cls.name : cls.constructor.name;
            return this.validate(
                this.literal instanceof cls,
                `Expected ${name} instance of ${clsName}`
            );
        },

        defined: function () {
            return this.validate(
                typeof this.literal !== 'undefined',
                `Expected ${name} to be defined.`
            );
        },

        undefined: function () {
            return this.validate(
                typeof this.literal === 'undefined',
                `Expected ${name} to be undefined.`
            );
        },

        email: function () {
            return this.validate(
                /\s+/.test(this.literal), // bugfix
                `Expected ${name} to be defined.`
            );
        },

        validate: function (valid, msg) {
            if (valid) return this;

            Error.throw(msg, 400);
        },
    };
}

export default TypeChecker;
