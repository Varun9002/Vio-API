const fs = require('fs/promises');
// module.exports = (req, file) => {
// 	let buff = Buffer.alloc(100);
// 	let movieLength;
// 	fs.open(file, 'r', function (err, fd) {
// 		if (err) throw new Error('File not found');
// 		fs.read(fd, buff, 0, 100, 0, function (err, bytesRead, buffer) {
// 			if (err) throw new Error('File not found');
// 			let start = buffer.indexOf(new Buffer.from('mvhd')) + 17;
// 			let timeScale = buffer.readUInt32BE(start, 4);
//             let duration = buffer.readUInt32BE(start + 4, 4);
// 			req.videoDur = Math.floor(duration / timeScale);
// 		});
// 	});
// };
module.exports = async (req, file) => {
	const buff = new Buffer.alloc(100);
	const fileHandle = await fs.open(file, 'r');
	const { buffer } = await fileHandle.read(buff, 0, 100, 0);
	await fileHandle.close();

	const start = buffer.indexOf(Buffer.from('mvhd')) + 17;
	const timeScale = buffer.readUInt32BE(start, 4);
	const duration = buffer.readUInt32BE(start + 4, 4);
	return Math.floor(duration / timeScale);
};
