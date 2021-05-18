const fs = require("fs");

if (fs.existsSync("./env-config.js"))
    fs.unlinkSync("./env-config.js")

if (process.argv[2]) {
    if (fs.existsSync(process.argv[2])) {
        const envFile = fs.readFileSync(process.argv[2], { encoding: 'utf8' });
        envFile.split("\n") // process line by line
        // remove comments
        .map(v=>{
            let i = v.indexOf("#");
            return i !== -1 ? v.slice(0, i) : v;
        })
        // filter out invalid syntax lines
        .filter(v=>v.indexOf("=") !== -1)
        // parse into env
        .forEach(v => {
            let key = v.slice(0, v.indexOf("="));
            let value = v.slice(v.indexOf("=")+1);

            // dont overwrite
            if (process.env[key]) return;

            // put into env
            process.env[key] = value;
        })
    }
}

const envString = Object.keys(process.env) // all environment variables
    .filter(v=>v.startsWith("VIVID_")) // only environment variables that start with VIVID_
    .map(v=>`"${v}": "${process.env[v]}",`) // turn into js code
    .join("\n") // join everything with a newline

const generated = "window._env_ = {\n" + envString + "\n};\n";

fs.writeFileSync("./env-config.js", generated);
