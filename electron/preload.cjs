const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{image:()=>ipcRenderer.invoke('image'),open:()=>ipcRenderer.invoke('open'),save:(p,as)=>ipcRenderer.invoke('save',p,as),export:(files,preview)=>ipcRenderer.invoke('export',files,preview)});
