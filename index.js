#!/usr/bin/env node

const program = require("commander");
const download = require("download-git-repo");
const ora = require("ora");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const packageData = require("./package.json");
const inquirer = require("inquirer");

const gitRepo = {
  mob_base_vue:
    "direct:http://gitlab.code.mob.com/web-developer/mob-base-vue.git",
  mob_base_vde: "direct:https://github.com/weijiaa/mobtech-vde.git",
  mob_base_react_antd:
    "direct:http://gitlab.code.mob.com/web-developer/mob_base_react",
  mob_base_rde: "direct:https://github.com/weijiaa/mobtech-rde.git",
  webpack_starter_vue_lib:
    "direct:https://github.com/FAKER-A/webpack-starter-vue-lib.git"
};

program
  .version(packageData.version)
  .option("-i, --init", "初始化项目")
  .option("-V, --version", "查看版本信息")
  .option("-h, --help", "查看帮助信息");
program.parse(process.argv);

if (program.init) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "projectName",
        message: "请输入项目名称"
      },
      {
        type: "list",
        name: "template",
        message: "选择其中一个作为项目模板",
        choices: [
          "mob_base_vue (vue 项目模板)",
          "mob_base_vde (vue 项目模板纯净版)",
          "mob_base_rde (react 项目模板纯净版)",
          "mob_base_react_antd (react 项目模板)",
          "webpack_starter_vue_lib (vue 开源组件开发模板[beta])"
        ]
      }
    ])
    .then(answers => {
      let url = gitRepo[answers.template.split(" ")[0]];
      let name = answers.projectName;
      initTemplateDefault(name, url);
    });
}

async function initTemplateDefault(name, gitUrl) {
  const projectName = name;
  console.log(
    chalk.bold.cyan("mobTechCli: ") + "will creating a new project starter"
  );
  const spinner = ora("download template......").start();
  try {
    await checkName(projectName);
    await downloadTemplate(gitUrl, projectName);
    await changeTemplate(projectName);
    spinner.clear();
    console.log(chalk.green("template download completed"));
    console.log(
      chalk.bold.cyan("mobTechCli: ") + "a new project starter is created"
    );
    console.log(
      chalk.green(
        `cd ${projectName} && npm install or cd ${projectName} && yarn`
      )
    );
    process.exit(1);
  } catch (error) {
    spinner.clear();
    console.log(chalk.red(error));
    process.exit(1);
  }
}

function checkName(projectName) {
  return new Promise((resolve, reject) => {
    fs.readdir(process.cwd(), (err, data) => {
      if (err) {
        return reject(err);
      }
      if (data.includes(projectName)) {
        return reject(new Error(`${projectName} already exists!`));
      }
      resolve();
    });
  });
}

function downloadTemplate(gitUrl, projectName) {
  return new Promise((resolve, reject) => {
    download(
      gitUrl,
      path.resolve(process.cwd(), projectName),
      { clone: true },
      function(err) {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
}
function changeTemplate(projectName) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.resolve(process.cwd(), projectName, "package.json"),
      "utf8",
      (err, data) => {
        if (err) {
          return reject(err);
        }
        let packageData = JSON.parse(data);
        packageData.name = projectName;
        fs.writeFile(
          path.resolve(process.cwd(), projectName, "package.json"),
          JSON.stringify(packageData, null, 2),
          "utf8",
          (err, data) => {
            if (err) {
              return reject(err);
            }
            resolve();
          }
        );
      }
    );
  });
}
