var fileName = process.argv[2];

var file = fs.createReadStream(fileName);

file.pipe(process.stdout);