const {spawn}=require('node:child_process');
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js'],{stdio:'inherit'});
setTimeout(()=>{const electron=spawn(require('electron'),['.'],{stdio:'inherit',env:{...process.env,CWE_DEV:'1'}});electron.on('exit',()=>{vite.kill();process.exit()})},2000);
