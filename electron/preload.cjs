const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{fonts:()=>ipcRenderer.invoke('fonts'),external:url=>ipcRenderer.invoke('external',url),image:()=>ipcRenderer.invoke('image'),open:()=>ipcRenderer.invoke('open'),save:(p,as)=>ipcRenderer.invoke('save',p,as),export:(files,preview)=>ipcRenderer.invoke('export',files,preview)});
