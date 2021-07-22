/*
 * @Author: Archy
 * @Date: 2021-07-21 15:40:44
 * @LastEditors: Archy
 * @LastEditTime: 2021-07-21 15:40:52
 * @FilePath: \archyInk\pm2.js
 * @description: 
 */
//run
const { exec } = require('child_process')
exec('hexo server',(error, stdout, stderr) => {
        if(error){
                console.log('exec error: ${error}')
                return
        }
        console.log('stdout: ${stdout}');
        console.log('stderr: ${stderr}');
})