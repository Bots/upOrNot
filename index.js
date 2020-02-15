#!/usr/bin/env node
const fetch = require('node-fetch')
const open = require('open')
const arg = require('arg')
const inquirer = require('inquirer')

function ParseCliArgsIntoOptions() {
    const args = arg(
      {
        '--website': Boolean,
        '--yes': Boolean,
        '-w': '--website',
        '-y': '--yes'
      },
      {
        argv: process.argv.slice(2)
      }
    )
    return {
      website: args['--website'] || false
    }
}

async function PromptForOptions(options) {
    const questions = [];

    if (!options.website) {
      questions.push({
        type: 'confirm',
        name: 'website',
        message: 'Open the website on your browser?',
        default: false,
      });
    }

    const answers =  await inquirer.prompt(questions);
    return {
      ...options,
      website: options.website || answers.website,
    };
}

async function LaunchWebsite(result) {
    let options = ParseCliArgsIntoOptions();
    options =  await PromptForOptions(options);
    if (options.website == true) {
        open(`https://${result.domain}`); 
    }
}

const site = process.argv[2]

function CheckSite(name) {
    if (name.indexOf('.') > -1) {
        const info = fetch(`https://isitup.org/${name}.json`)
        .then(response => response.json())
        
        info.then(function(result) {
            console.log(result.response_code)
            switch(result.response_code) {
                case 200:
                    console.log('\x1b[32m%s\x1b[0m', 'website appears to be up and running')
                    LaunchWebsite(result)
                    break
                case 301:
                    console.log('\x1b[34m%s\x1b[0m', 'website has been moved permanently but appears to be up and running')
                    LaunchWebsite(result)
                    break
                case 302:
                    console.log('\x1b[34m%s\x1b[0m', 'website has a temporary redirect but appears to be up and running')
                    LaunchWebsite(result)
                    break
                case 403:
                    console.log('\x1b[33m%s\x1b[0m', 'website information not found')
                    LaunchWebsite(result)
                    break
                default:
                    console.log('\x1b[31m%s\x1b[0m', 'website appears to be down')
                    break
            }
        })
    } else {
        console.log('\x1b[31m%s\x1b[0m', 'please append a url extension (whatever.com)')
    }
}

CheckSite(site)