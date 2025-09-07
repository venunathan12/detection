import fs from 'node:fs/promises';

import builtintypes from './types.json' with { type: "json" };

class Detector
{
    private types: {[key: string]: any} = {};
    private importedfiles: {[key: string]: boolean} = {};

    public info: string[] = [];
    public warnings: string[] = [];
    public errors: string[] = [];

    private chain: any[] = [];

    public async LoadTypesFromFile(typespath: string): Promise<void>
    {
        if (this.importedfiles[typespath] !== undefined) {
            this.warnings.push(`File ${typespath} is already imported ! Ignoring !\n`); return;
        }

        let types = JSON.parse((await fs.readFile(typespath)).toString());

        await this.LoadTypes(typespath, types);

        this.importedfiles[typespath] = true;
    }

    public async LoadTypes(typespath: string, types: any): Promise<void>
    {
        for (let typeref of types)
        {
            if (typeof typeref === 'string')
                if (typeref === 'builtin://*')
                    await this.LoadTypes(typeref, builtintypes);
                else
                    await this.LoadTypesFromFile(typeref);
            else
            {
                if (typeof typeref !== 'object' || typeref instanceof Array) {
                    this.errors.push(`Following Type Definition is Invalid !\nFile: ${ typespath }\nType: ${ JSON.stringify(typeref) }\n`);
                    throw new Error(this.errors.join('\n'));
                }
                let id = typeref.id;
                if (id === undefined || id == null || typeof id !== 'string') {
                    this.errors.push(`Following Type Definition does not have a valid ID !\nFile: ${ typespath }\nType: ${ JSON.stringify(typeref) }\n`);
                    throw new Error(this.errors.join('\n'));
                }
                if (this.types[id] !== undefined) {
                    this.errors.push(`Following Type Definition conflicts with an existing Type !\nFile: ${ typespath }\nType: ${ JSON.stringify(typeref) }\n`);
                    throw new Error(this.errors.join('\n'));
                }

                this.types[id] = typeref;
            }
        }
    }

    public Assert(current: any, typename: string, typeargs: any, verbose: boolean = true): boolean
    {
        this.chain = [ current ];

        this.info = [];
        this.warnings = [];
        this.errors = [];

        return this.AssertType(current, typename, typeargs, verbose);
    }

    private AssertType(current: any, typename: string, typeargs: any, verbose: boolean = true): boolean
    {
        let typeref = this.types[typename];
        if (typeref == null) {
            this.errors.push(`Encountered unknown Type ${typename} during Type Assertion !\n`);
            throw new Error(this.errors.join('\n'));
        }

        let self = this;
        let P = function (newcurrent: any, newcurrentkey: string | number | null, typename: string, typeargs: any, verbose: boolean = true): boolean
        {
            return self.AssertSubType(newcurrent, newcurrentkey, typename, typeargs, verbose);
        }
        let Q = structuredClone(typeref.defaultargs); if (Q != null && typeargs != null) for (let key of Object.keys(typeargs)) Q[key] = typeargs[key];
        let X = current; let Y = this.chain; let Z = typeref;
        
        let redirectedtype = typeref.type;
        if (redirectedtype != null) if (P(current, null, redirectedtype.id, redirectedtype.args, true) !== true) { if (verbose === true) this.info.push(`Data: ${ JSON.stringify(current) } does not match Type ${ typename } !\n`); return false; }
        
        let assertions = typeref.assertions; if (redirectedtype == null && assertions == null) this.warnings.push(`Type ${ typename } has neither a Parent Type not assertions defined. Treating as having empty list of assertions.\n`);
        if (assertions == null) assertions = [];
        for (let assertion of assertions)
        {
            let M = null;
            let assertionfunc = function(){ return false; }; eval(`assertionfunc = function(){ ${ assertion } }`);
            let assertionresult = assertionfunc();
            if (assertionresult !== true) {
                if (verbose === true)
                {
                    if (M != null && typeof M === 'string') this.info.push(M);
                    this.info.push(`Data: ${ JSON.stringify(current) } does not match Type ${ typename } !\n`);
                }
                return false;
            }
        }

        return true;
    }

    private AssertSubType(newcurrent: any, newcurrentkey: string | number | null, typename: string, typeargs: any, verbose: boolean = true): boolean
    {
        let newchainitem = newcurrentkey != null;
        if (newchainitem) this.chain.push(newcurrentkey), this.chain.push(newcurrent);
        let submatchresult = this.AssertType(newcurrent, typename, typeargs, verbose);
        if (newchainitem) this.chain.pop(), this.chain.pop();
        return submatchresult;
    }
}

export default Detector;
