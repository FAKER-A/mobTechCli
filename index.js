#!/usr/bin/env node

const program = require("commander");
const download = require("download-git-repo");
const ora = require("ora");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const packageData = require("./package.json");

const gitRepo = {
  base: "direct:git@gitlab.code.mob.com:web-developer/mob-base-vue.git"
};

program
  .version(packageData.version)
  .option("-i, init <projectName>", "input project name");
program.parse(process.argv);

if (program.init) {
  initTemplateDefault();
}

async function initTemplateDefault() {
  const projectName = program.init;
  console.log(
    chalk.bold.cyan("mobTechCli: ") + "will creating a new vue starter"
  );
  const spinner = ora("download template......").start();
  try {
    await checkName(projectName);
    await downloadTemplate(gitRepo.base, projectName);
    await changeTemplate(projectName);
    spinner.clear();
    console.log(chalk.green("template download completed"));
    console.log(
      chalk.bold.cyan("mobTechCli: ") + "a new vue starter is created"
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
