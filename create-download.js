const { exec } = require('child_process');
const manifest = require('./manifest.json');
exec(
  `tar -cvzf  ./downloads/chrome-sidebar-aitabs-${manifest.version}.zip dist/`,
  (error, stdout, stderr) => {
    if (error) {
      console.log(`执行的错误: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }
  }
);
