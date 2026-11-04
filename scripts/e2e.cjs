const { _electron:electron }=require('playwright');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve('.test-output');await fs.mkdir(root,{recursive:true});
 const image=path.join(root,'original.png');await fs.writeFile(image,Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64'));
 const projectDir=path.join(root,'project'),exportDir=path.join(root,'website');await fs.mkdir(projectDir,{recursive:true});await fs.mkdir(exportDir,{recursive:true});
 async function launch(){const app=await electron.launch({executablePath:process.env.E2E_EXE||undefined,args:process.env.E2E_EXE?[]:['.'],env:{...process.env,CWE_DEV:''}});console.log('launched');const win=await app.firstWindow();win.setDefaultTimeout(15000);win.on('console',m=>console.log('renderer',m.text()));console.log('window ready');await win.waitForSelector('.board');return {app,win}}
 let {app,win}=await launch();const errors=[];win.on('pageerror',e=>errors.push(e.message));
 async function dialog(file){await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]})},file)}
 console.log('add text');await win.locator('.components button').nth(0).click();await win.locator('.board').click({position:{x:60,y:60},force:true});await win.getByLabel('文本内容').fill('你好，独立网页 < & >');await win.getByLabel('X',{exact:true}).fill('120');await win.getByLabel('Y',{exact:true}).fill('150');await win.getByLabel('字号',{exact:true}).fill('42');
 const text=win.locator('.board>div').filter({hasText:'你好，独立网页'});await text.waitFor();
 console.log("drag");const box=await text.boundingBox();await win.mouse.move(box.x+20,box.y+20);await win.mouse.down();await win.mouse.move(box.x+85,box.y+52.5,{steps:5});await win.mouse.up();assert.equal(await win.getByLabel('X',{exact:true}).inputValue(),'220');
 console.log("resize");let h=await win.locator('.resize').boundingBox();await win.mouse.move(h.x+5,h.y+5);await win.mouse.down();await win.mouse.move(h.x+70,h.y+37.5,{steps:5});await win.mouse.up();assert.equal(await win.getByLabel('宽度',{exact:true}).inputValue(),'420');
 h=await win.locator('.rotate').boundingBox();await win.mouse.move(h.x+5,h.y+5);await win.mouse.down();await win.mouse.move(h.x+80,h.y+70,{steps:5});await win.mouse.up();assert.notEqual(await win.getByLabel('角度',{exact:true}).inputValue(),'0');
 console.log("image");await dialog(image);await win.locator('.components button').nth(1).click();await win.getByLabel('元素名称').fill('原图');await win.getByLabel('X',{exact:true}).fill('700');
 await win.locator('.layer').filter({hasText:'原图'}).getByTitle('锁定 / 解锁').click();assert.equal(await win.getByLabel('X',{exact:true}).isDisabled(),true);await win.locator('.layer').filter({hasText:'原图'}).getByTitle('锁定 / 解锁').click();
 await win.locator('.layer').filter({hasText:'原图'}).dragTo(win.locator('.layer').filter({hasText:'文本'}));
 await win.locator('.sectionTitle').filter({hasText:'页面'}).getByRole('button').click();console.log('add text');await win.locator('.components button').nth(0).click();await win.locator('.board').click({position:{x:60,y:60},force:true});await win.getByLabel('文本内容').fill('第二页');
 console.log("save");await dialog(projectDir);await win.getByRole('button',{name:'保存',exact:true}).click();await win.locator('footer').filter({hasText:'已保存'}).waitFor();
 const saved=JSON.parse(await fs.readFile(path.join(projectDir,'project.json'),'utf8'));assert.equal(saved.pages.length,2);assert.equal(saved.pages[0].elements.length,2);assert.equal(saved.pages[0].elements.find(e=>e.type==='image').zIndex,0);const src=saved.pages[0].elements.find(e=>e.type==='image').src;assert.deepEqual(await fs.readFile(path.join(projectDir,src)),await fs.readFile(image));
 await app.close();({app,win}=await launch());await dialog(path.join(projectDir,'project.json'));await win.getByRole('button',{name:'打开',exact:true}).click();await win.locator('footer').filter({hasText:'已恢复'}).waitFor();assert.equal(await win.locator('.board>img').count(),1);
 console.log('add text');await win.locator('.components button').nth(0).click();await win.locator('.board').click({position:{x:60,y:60},force:true});await win.getByLabel('文本内容').fill('撤销测试');await win.locator('.canvasBar').click();await win.keyboard.press('Control+z');assert.notEqual(await win.getByLabel('文本内容').inputValue(),'撤销测试');await win.keyboard.press('Control+y');assert.equal(await win.getByLabel('文本内容').inputValue(),'撤销测试');
 await win.keyboard.press('Control+c');await win.keyboard.press('Control+v');assert.equal(await win.locator('.board>div:not(.selection)').count(),3);await win.keyboard.press('Delete');assert.equal(await win.locator('.board>div:not(.selection)').count(),2);
 await win.keyboard.press('Control+a');assert.match(await win.locator('.selection .badge').textContent(),/3 个对象/);await win.keyboard.press('Escape');
 const imageLayer=win.locator('.layer').filter({hasText:'原图'});await imageLayer.getByTitle('显示 / 隐藏').click();assert.equal(await win.locator('.board>img').isVisible(),false);await imageLayer.getByTitle('显示 / 隐藏').click();assert.equal(await win.locator('.board>img').isVisible(),true);
 await win.getByRole('button',{name:'◉ 预览',exact:true}).click();assert.equal(await win.locator('header').isVisible(),false);assert.equal(await win.locator('.selection').count(),0);await win.keyboard.press('Escape');
 await dialog(exportDir);await win.getByRole('button',{name:'导出网站 ↗',exact:true}).click();await win.locator('footer').filter({hasText:'已导出'}).waitFor();await win.screenshot({path:path.join(root,'editor.png')});assert.deepEqual(errors,[]);await app.close();
 // Use Electron as a plain isolated browser window, independent of editor renderer.
 const exported=await electron.launch({args:[path.join(__dirname,'preview-test.cjs'),path.join(exportDir,'index.html')]});const web=await exported.firstWindow();await web.waitForSelector('img');assert.equal(await web.locator('img').evaluate(e=>e.complete&&e.naturalWidth>0),true);assert.ok((await web.locator('main').textContent()).includes('你好，独立网页'));await web.screenshot({path:path.join(root,'website.png')});await exported.close();console.log('PASS: desktop edit / drag / resize / rotate / image / lock / layers / multipage / save / restart / open / undo / redo / clipboard / export / independent HTML');
})().catch(e=>{console.error(e);process.exit(1)});




